import { usePage, Link } from "@inertiajs/react";
import { Mail, Phone, MapPin, CalendarDays, UserRound, Edit2 } from "lucide-react";
import DefaultCover from "@/assets/default-cover.jpg";
import DefaultAvatar from '@/assets/default-avatar.jpg';
import { Location, User } from "@/types";
import { toast, Toaster } from 'sonner';

export default function ProfileCard() {
  const { auth } = usePage().props;
  const { user } = auth as { user: User; location: Location };

  return (
    <div className="w-full bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-40 sm:h-62 bg-gray-200 dark:bg-gray-700">
        <img
          src={user.coverPhoto || DefaultCover}
          alt="Cover"
          className="h-full w-full object-cover"
          onError={(e) => (e.currentTarget.src = DefaultCover)}
        />
      </div>

      {/* Avatar and Basic Info */}
      <div className="relative px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-start">
          {/* Avatar */}

          <div className="relative -mt-12 sm:-mt-16 flex-shrink-0 flex justify-center sm:justify-start w-full sm:w-auto">
            <img
              src={user.profilePicture || DefaultAvatar}
              alt="Profile"
              className="h-34 w-34 sm:h-34 sm:w-34 rounded-full border-4 border-white dark:border-gray-800 shadow-md object-cover"
              onError={(e) => (e.currentTarget.src = DefaultAvatar)}
            />

            <label className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 hover:opacity-100 rounded-full cursor-pointer transition">
              <Edit2 className="w-5 h-5 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  if (!file.type.startsWith("image/")) {
                    toast.error("Only image files are allowed.");
                    e.target.value = "";
                    return;
                  }

                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    (e.target as HTMLInputElement).parentElement!
                      .querySelector('img')!
                      .setAttribute('src', ev.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>

          </div>

          {/* Name, Status, Position * Department */}
          <div className="mt-6 sm:mt-2 sm:ml-6 flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {user.info?.FullName ?? "N/A"}
              </h2>
              <span
                className={`h-3 w-3 rounded-full ${user.isActive === "1"
                  ? "bg-green-500"
                  : "bg-gray-400 dark:bg-gray-600"
                  }`}
                title={user.isActive === "1" ? "Active" : "Inactive"}
              />
            </div>

            {/* Position * Department */}
            <p className="-mt-1 text-center sm:text-left">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {user.info?.PositionLevel ?? "N/A"}
              </span>
              <span className="text-xs font-light text-gray-500 dark:text-gray-400 mx-1">
                {String.fromCharCode(8226)}
              </span>
              <span className="text-xs font-light text-gray-500 dark:text-gray-400">
                {user.info?.Department ?? "N/A"}
              </span>
            </p>
          </div>
        </div>
      </div>


      {/* Additional Details */}
      <div className="px-4 sm:px-6 pb-6 mt-4 space-y-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200">{user.info?.Email ?? "N/A"}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200">{user.info?.location?.MobileNumber ?? "N/A"}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200">{user.info?.location?.Municipal ?? "N/A"}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarDays className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200">
            Date Hired:{" "}
            {user.info?.DateHired
              ? new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }).format(new Date(user.info?.DateHired))
              : "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <UserRound className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200">Employee No.: {user.info?.EmployeeNo ?? "N/A"}</span>
        </div>
      </div>
    </div>
  );
}
