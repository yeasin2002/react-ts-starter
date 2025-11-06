import { Link } from "react-router";

export default function UserProfile() {
  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold">User Profile</h1>
        <p className="mb-6 text-gray-600">Route: /users/profile</p>

        <div className="mb-8 rounded border p-6">
          <h2 className="mb-4 text-xl font-semibold">Profile Information</h2>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Name:</span> Current User
            </p>
            <p>
              <span className="font-semibold">Email:</span> user@example.com
            </p>
            <p className="mt-4 text-sm text-gray-600">This is a static nested route under /users</p>
          </div>
        </div>

        <div className="space-x-4">
          <Link to="/users" className="text-blue-600 hover:underline">
            ← Back to Users
          </Link>
          <Link to="/" className="text-blue-600 hover:underline">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
