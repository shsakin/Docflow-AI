"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface ProfileData {
  totalUploaded: number;
  accepted: number;
  rejected: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => setProfileData(data));
    }
  }, [status]);

  if (status === "loading") {
    return <p className="p-6">Loading profile...</p>;
  }

  if (!session?.user) {
    return <p className="p-6 text-red-600">You must be logged in to view this page.</p>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">👤 My Profile</h1>

      <div className="bg-white shadow rounded-2xl p-6 max-w-lg">
        <p className="text-lg text-gray-900">
          <strong>Name:</strong> {session.user.name}
        </p>
        <p className="text-lg text-gray-900">
          <strong>Email:</strong> {session.user.email}
        </p>
        <p className="text-lg text-gray-900">
          <strong>Role:</strong>{" "}
          <span className="capitalize">{session.user.role}</span>
        </p>

        {profileData && (
          <div className="mt-6 space-y-3">
            <p className="text-gray-800">
              📂 <strong>Total Uploaded:</strong> {profileData.totalUploaded}
            </p>

            {/* Extra stats only for reviewers/admins */}
            {(session.user.role === "admin" || session.user.role === "reviewer") && (
              <>
                <p className="text-green-600">
                  ✅ <strong>Accepted:</strong> {profileData.accepted}
                </p>
                <p className="text-red-600">
                  ❌ <strong>Rejected:</strong> {profileData.rejected}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
