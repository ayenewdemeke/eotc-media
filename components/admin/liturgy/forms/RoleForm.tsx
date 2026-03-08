"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const roleSchema = z.object({
  roleKey: z
    .string()
    .min(1, "Role key is required")
    .regex(/^[a-z_]+$/, "Role key must be lowercase letters and underscores only"),
  nameAmharic: z.string().min(1, "Amharic name is required"),
  nameEnglish: z.string().min(1, "English name is required"),
  orderIndex: z.number().int().min(0, "Order index must be a positive number"),
})

type RoleFormValues = z.infer<typeof roleSchema>

interface RoleFormProps {
  initialData?: {
    id: number
    roleKey: string
    nameAmharic: string
    nameEnglish: string
    orderIndex: number
  }
  inModal?: boolean
  onSuccess?: () => void
  onCancel?: () => void
}

export function RoleForm({ initialData, inModal, onSuccess, onCancel }: RoleFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!initialData

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      roleKey: initialData?.roleKey || "",
      nameAmharic: initialData?.nameAmharic || "",
      nameEnglish: initialData?.nameEnglish || "",
      orderIndex: initialData?.orderIndex || 0,
    },
  })

  async function onSubmit(values: RoleFormValues) {
    setIsLoading(true)

    try {
      const url = isEditing
        ? `/api/liturgy/admin/roles/${initialData.id}`
        : "/api/liturgy/admin/roles"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Something went wrong")
        return
      }

      toast.success(isEditing ? "Role updated successfully" : "Role created successfully")
      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/liturgy/admin/roles")
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
        <FormField
              control={form.control}
              name="roleKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role key</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., priest, deacon, people"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    A unique identifier for this role (lowercase, underscores only)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameAmharic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (Amharic)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ካህን" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameEnglish"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Priest" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Display order (lower numbers appear first)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update role"
              : "Create role"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onCancel ? onCancel() : router.push("/liturgy/admin/roles")}
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
        <CardTitle>{isEditing ? "Edit role" : "Create role"}</CardTitle>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  )
}
