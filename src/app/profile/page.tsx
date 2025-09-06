"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface ProfileData {
  totalUploaded: number;
  accepted: number;
  rejected: number;
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);


  const [search, setSearch] = useState("");
  const [searchedProfile, setSearchedProfile] = useState<UserProfile | null>(null);
  const [searchedStats, setSearchedStats] = useState<ProfileData | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          setProfileData(data.stats);
          setUserProfile(data.user);
        });
    }
  }, [status]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoadingSearch(true);
    try {
      const res = await fetch(`/api/profile?name=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (res.ok) {
        setSearchedProfile(data.user);
        setSearchedStats(data.stats);
      } else {
        setSearchedProfile(null);
        setSearchedStats(null);
      }
    } finally {
      setLoadingSearch(false);
    }
  };

  if (status === "loading") {
    return <p className="p-6">Loading profile...</p>;
  }

  if (!session?.user) {
    return (
      <p className="p-6 text-red-600">
        You must be logged in to view this page.
      </p>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">👤 My Profile</h1>

      {/* 🔍 Search bar */}
      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search user by name..."
          className="flex-1 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>

      {/* Current User Profile */}
      {userProfile && (
        <div className="bg-white shadow rounded-2xl p-6 max-w-lg mb-10">
          <p className="text-lg text-gray-900">
            <strong>Name:</strong> {userProfile.name}
          </p>
          <p className="text-lg text-gray-900">
            <strong>Email:</strong> {userProfile.email}
          </p>
          <p className="text-lg text-gray-900">
            <strong>Role:</strong>{" "}
            <span className="capitalize">{userProfile.role}</span>
          </p>

          {profileData && (
            <div className="mt-6 space-y-3">
              <p className="text-gray-800">
                📂 <strong>Total Uploaded:</strong> {profileData.totalUploaded}
              </p>
              {(userProfile.role === "admin" ||
                userProfile.role === "reviewer") && (
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
      )}

      {/* 🔍 Searched User Profile */}
      {searchedProfile && (
        <div className="bg-white shadow rounded-2xl p-6 max-w-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            🔎 Searched User: {searchedProfile.name}
          </h2>
          <p className="text-lg text-gray-900">
            <strong>Email:</strong> {searchedProfile.email}
          </p>
          <p className="text-lg text-gray-900">
            <strong>Role:</strong>{" "}
            <span className="capitalize">{searchedProfile.role}</span>
          </p>

          {searchedStats && (
            <div className="mt-6 space-y-3">
              <p className="text-gray-800">
                📂 <strong>Total Uploaded:</strong> {searchedStats.totalUploaded}
              </p>
              {(searchedProfile.role === "admin" ||
                searchedProfile.role === "reviewer") && (
                <>
                  <p className="text-green-600">
                    ✅ <strong>Accepted:</strong> {searchedStats.accepted}
                  </p>
                  <p className="text-red-600">
                    ❌ <strong>Rejected:</strong> {searchedStats.rejected}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {loadingSearch && <p className="mt-4 text-gray-500">Searching...</p>}
    </div>
  );
}
