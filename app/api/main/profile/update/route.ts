import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { putObject, deleteObject } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const image = formData.get('image') as File | null

    // Validation
    if (!name) {
      return NextResponse.json(
        { errors: { name: 'Name is required' } },
        { status: 400 }
      )
    }

    const userId = parseInt(session.user.id)

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let imageName = user.image

    // Handle image upload
    if (image && image.size > 0) {
      // Validate image
      if (image.size > 10240 * 1024) {
        return NextResponse.json(
          { errors: { image: 'Image must be less than 10MB' } },
          { status: 400 }
        )
      }

      if (!image.type.startsWith('image/')) {
        return NextResponse.json(
          { errors: { image: 'File must be an image' } },
          { status: 400 }
        )
      }

      // Generate unique filename
      const buffer = Buffer.from(await image.arrayBuffer())
      const timestamp = Date.now()
      const extension = image.name.split('.').pop()
      imageName = `${userId}_${timestamp}.${extension}`

      // Delete old image if exists (best-effort)
      if (user.image && user.image !== 'default.jpg') {
        try {
          await deleteObject(`profiles/${user.image}`)
        } catch (error) {
          console.error('Error deleting old image:', error)
        }
      }

      // Save new image to R2 under profiles/<filename>
      await putObject(`profiles/${imageName}`, buffer, image.type || 'image/jpeg')
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        image: imageName
      }
    })

    console.log('User updated successfully:', {
      id: updatedUser.id,
      name: updatedUser.name,
      image: updatedUser.image
    })

    return NextResponse.json({
      success: true,
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image
      }
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
