import { Link, useParams } from "react-router";

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold">User Details</h1>
        <p className="mb-6 text-gray-600">Route: /users/:id (dynamic route)</p>

        <div className="mb-8 rounded border p-6">
          <p className="mb-2 text-lg">
            <span className="font-semibold">User ID:</span> {id}
          </p>
          <p className="text-gray-600">
            This is a dynamic route that matches /users/1, /users/2, etc.
          </p>
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
