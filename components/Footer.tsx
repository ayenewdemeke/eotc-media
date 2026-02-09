export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-4 mt-8">
      <div className="container mx-auto px-4 text-center text-sm text-gray-600">
        <p>
          Copyright © {new Date().getFullYear()}{' '}
          <a href="/" className="text-blue-600 hover:underline">
            EOTC Media
          </a>
          . All rights reserved.
        </p>
      </div>
    </footer>
  )
}
