import { Link } from "react-router";

export default function About() {
  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold">About Page</h1>
        <p className="mb-6 text-gray-600">This is the about page demonstrating static routing.</p>
        <p className="mb-4">Route: /about</p>
        <Link to="/" className="text-blue-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
