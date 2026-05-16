"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const textSchema = z.object({
  sectionId: z.string().min(1, "Section is required"),
  roleId: z.string().min(1, "Role is required"),
  orderIndex: z.number().int().min(0, "Order index must be a positive number"),
  textGeez: z.string().min(1, "Ge'ez text is required"),
  textAmharic: z.string().min(1, "Amharic text is required"),
  textEnglishTransliteration: z.string().min(1, "English transliteration is required"),
  textEnglishTranslation: z.string().min(1, "English translation is required"),
  remark: z.string().optional(),
  audioGeezFilePath: z.string().optional(),
  audioEzilFilePath: z.string().optional(),
  audioArarayFilePath: z.string().optional(),
})

type TextFormValues = z.infer<typeof textSchema>

interface Section {
  id: number
  nameEnglish: string
}

interface Role {
  id: number
  roleKey: string
  nameEnglish: string
}

interface TextFormProps {
  initialData?: {
    id: number
    sectionId: number
    roleId: number
    orderIndex: number
    textGeez: string
    textAmharic: string
    textEnglishTransliteration: string
    textEnglishTranslation: string
    remark: string | null
    audioGeezFilePath: string | null
    audioEzilFilePath: string | null
    audioArarayFilePath: string | null
  }
  inModal?: boolean
  onSuccess?: () => void
  onCancel?: () => void
}

export function TextForm({ initialData, inModal, onSuccess, onCancel }: TextFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [sections, setSections] = useState<Section[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [uploadingAudio, setUploadingAudio] = useState<string | null>(null)
  const isEditing = !!initialData

  const form = useForm<TextFormValues>({
    resolver: zodResolver(textSchema),
    defaultValues: {
      sectionId: initialData?.sectionId?.toString() || "",
      roleId: initialData?.roleId?.toString() || "",
      orderIndex: initialData?.orderIndex || 0,
      textGeez: initialData?.textGeez || "",
      textAmharic: initialData?.textAmharic || "",
      textEnglishTransliteration: initialData?.textEnglishTransliteration || "",
      textEnglishTranslation: initialData?.textEnglishTranslation || "",
      remark: initialData?.remark || "",
      audioGeezFilePath: initialData?.audioGeezFilePath || "",
      audioEzilFilePath: initialData?.audioEzilFilePath || "",
      audioArarayFilePath: initialData?.audioArarayFilePath || "",
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectionsRes, rolesRes] = await Promise.all([
          fetch("/api/liturgy/admin/sections?limit=100"),
          fetch("/api/liturgy/admin/roles?limit=100"),
        ])

        const sectionsData = await sectionsRes.json()
        const rolesData = await rolesRes.json()

        if (sectionsRes.ok) setSections(sectionsData.sections)
        if (rolesRes.ok) setRoles(rolesData.roles)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }

    fetchData()
  }, [])

  const handleAudioUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "audioGeezFilePath" | "audioEzilFilePath" | "audioArarayFilePath"
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAudio(fieldName)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("textId", initialData?.id?.toString() || "new")
      formData.append("audioType", fieldName.replace("audio", "").replace("FilePath", "").toLowerCase())

      const response = await fetch("/api/liturgy/admin/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to upload audio")
        return
      }

      form.setValue(fieldName, data.path)
      toast.success("Audio uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload audio")
    } finally {
      setUploadingAudio(null)
    }
  }

  async function onSubmit(values: TextFormValues) {
    setIsLoading(true)

    try {
      const url = isEditing
        ? `/api/liturgy/admin/texts/${initialData.id}`
        : "/api/liturgy/admin/texts"
      const method = isEditing ? "PUT" : "POST"

      const payload = {
        ...values,
        sectionId: parseInt(values.sectionId),
        roleId: parseInt(values.roleId),
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Something went wrong")
        return
      }

      toast.success(
        isEditing ? "Text updated successfully" : "Text created successfully"
      )
      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/liturgy/admin/texts")
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section and Role Selection */}
        <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="sectionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a section" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem key={section.id} value={section.id.toString()}>
                            {section.nameEnglish}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.nameEnglish} ({role.roleKey})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Who recites this text</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="orderIndex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order index</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                      onChange={e => field.onChange(e.target.valueAsNumber)}
                      disabled={isLoading}
                      className="max-w-[200px]"
                    />
                  </FormControl>
                  <FormDescription>Order within the section</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Text Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Text content</h3>

              <FormField
                control={form.control}
                name="textGeez"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text (Ge'ez)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter Ge'ez text"
                        {...field}
                        disabled={isLoading}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="textAmharic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text (Amharic)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter Amharic text"
                        {...field}
                        disabled={isLoading}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="textEnglishTransliteration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>English Transliteration</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter English transliteration"
                        {...field}
                        disabled={isLoading}
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Ge'ez text written in Latin characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="textEnglishTranslation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>English Translation</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter English translation"
                        {...field}
                        disabled={isLoading}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remark (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="E.g. 'This text is specific to feast days' or 'Said only on Sundays'"
                        {...field}
                        disabled={isLoading}
                        rows={2}
                      />
                    </FormControl>
                    <FormDescription>
                      Day-specific notes or instructions shown below the text
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Audio Files */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Audio files (optional)</h3>

              {(["audioGeezFilePath", "audioEzilFilePath", "audioArarayFilePath"] as const).map(
                (fieldName) => {
                  const labels: Record<string, string> = {
                    audioGeezFilePath: "Ge'ez Audio",
                    audioEzilFilePath: "Ezil Audio",
                    audioArarayFilePath: "Araray Audio",
                  }

                  return (
                    <FormField
                      key={fieldName}
                      control={form.control}
                      name={fieldName}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{labels[fieldName]}</FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                placeholder="Audio file path or upload"
                                {...field}
                                disabled={isLoading}
                                className="flex-1"
                              />
                            </FormControl>
                            <div className="relative">
                              <input
                                type="file"
                                accept="audio/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => handleAudioUpload(e, fieldName)}
                                disabled={isLoading || uploadingAudio === fieldName}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                disabled={isLoading || uploadingAudio === fieldName}
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                            </div>
                            {field.value && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => form.setValue(fieldName, "")}
                                disabled={isLoading}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {uploadingAudio === fieldName && (
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )
                }
              )}
            </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading || !!uploadingAudio}>
            {isLoading
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update text"
              : "Create text"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onCancel ? onCancel() : router.push("/liturgy/admin/texts")}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )

  if (inModal) {
    return formContent
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit liturgical text" : "Create liturgical text"}</CardTitle>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  )
}
