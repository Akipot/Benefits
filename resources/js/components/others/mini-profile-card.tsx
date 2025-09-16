"use client"

import React from "react"
import DefaultAvatar from "@/assets/default-avatar.jpg";


interface MiniProfileCardProps {
  profilePic?: string
  fullName: string
  positionLevel?: string
  department?: string
}

export function MiniProfileCard({
  profilePic,
  fullName,
  positionLevel,
  department,
}: MiniProfileCardProps) {
  return (
    <div
      className="absolute right-0 mt-2 hidden group-hover:flex flex-col items-start
                 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                 rounded-lg shadow-lg p-3 w-64 z-50"
    >
      {/* Profile picture + name */}
      <div className="flex items-center space-x-3">
        <img
          src={profilePic ?? DefaultAvatar}
          alt={fullName}
          className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-600"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            {fullName}
          </span>

          <span className="text-xs text-gray-500 dark:text-gray-400">
            {positionLevel} - {department}
          </span>

        </div>
      </div>
    </div>
  )
}
