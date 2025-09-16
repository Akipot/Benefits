import { useEffect, useState, useRef } from "react";
import { Mail, Phone, MapPin, CalendarDays, UserRound, Edit2 } from "lucide-react";
import DefaultCover from "@/assets/default-cover.jpg";
import DefaultAvatar from "@/assets/default-avatar.jpg";
import { toast, Toaster } from "sonner";
import axios from "axios";
import { Eye, Camera } from "lucide-react";
import ImagePreview from '@/components/others/image-preview';

interface ProfileCardProps {
  fullName: string;
  position?: string;
  department?: string;
  email?: string;
  mobileNumber?: string;
  province?: string;
  dateHired?: string;
  employeeNumber?: string;
  avatar: string;
  coverPhoto?: string;
  isOwnProfile?: boolean;
  isActive?: string;
}

export default function ProfileCard({
  fullName,
  position,
  department,
  email,
  mobileNumber,
  province,
  dateHired,
  employeeNumber,
  avatar,
  coverPhoto,
  isOwnProfile = false,
  isActive,
}: ProfileCardProps) {

  const [profilePicture, setProfilePicture] = useState(avatar);
  const [coverPicture, setCoverPicture] = useState(coverPhoto);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setProfilePicture(avatar);
  }, [avatar]);

  useEffect(() => {
    setCoverPicture(coverPhoto);
  }, [coverPhoto]);

  const WebUrl = "";

  const handleChangeDP = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwnProfile) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 2MB.");
      e.target.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("profile_picture", file);
    setLoading(true);

    try {
      const { data } = await axios.post(WebUrl + "/api/insert-update-dp", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      const avatarUrl = `${data.path}?t=${new Date().getTime()}`;
      setProfilePicture(avatarUrl);
      toast.success(data.message || "Profile picture updated!");
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422 && err.response.data.errors) {
          const firstError = Object.values(err.response.data.errors)[0] as string[];
          toast.error(firstError[0]);
        } else {
          toast.error(err.response?.data?.message || "Failed to upload");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };


  const handleChangeCoverPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwnProfile) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 2MB.");
      e.target.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("cover_photo", file);
    setLoading(true);

    try {
      const { data } = await axios.post(WebUrl + "/api/insert-update-cover-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      const coverUrl = `${data.path}?t=${new Date().getTime()}`;
      setCoverPicture(coverUrl);
      toast.success(data.message || "Cover photo updated!");
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422 && err.response.data.errors) {
          const firstError = Object.values(err.response.data.errors)[0] as string[];
          toast.error(firstError[0]);
        } else {
          toast.error(err.response?.data?.message || "Failed to upload");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
      <Toaster position="top-right" />

      <div className="relative h-40 sm:h-62 bg-gray-200 dark:bg-gray-700">
        {/* Cover Image */}
        <img
          id="cover-photo"
          src={coverPicture || DefaultCover}
          alt="Cover"
          className="h-full w-full object-cover cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-103"
          onClick={() => setShowCoverModal(true)}
          onError={(e) => (e.currentTarget.src = DefaultCover)}
        />

        {isOwnProfile && (
          <label
            htmlFor="cover-photo-input"
            className="absolute top-2 right-2 md:bottom-2 md:top-auto 
               bg-white/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 
               py-1 px-3 rounded-full shadow-md text-xs flex items-center gap-1 
               cursor-pointer hover:bg-white/90 dark:hover:bg-gray-700/90 
               hover:scale-105 transition-all duration-200"
          >
            <Camera className="w-3 h-3" />
            Change Cover
          </label>
        )}

        {/* Hidden File Input */}
        <input
          id="cover-photo-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChangeCoverPhoto}

        />
      </div>


      {/* Avatar & Info */}
      <div className="relative px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6 items-center">
          {/* Avatar */}
          <div ref={wrapperRef} className="relative -mt-12 sm:-mt-16 flex-shrink-0">
            <img
              src={profilePicture}
              alt="Profile"
              className="h-32 w-32 sm:h-42 sm:w-42 rounded-full border-4 border-white dark:border-gray-800 shadow-md object-cover cursor-pointer 
             transition-transform duration-300 ease-in-out transform hover:scale-103"
              onClick={() => setShowOptions((prev) => !prev)}
            />


            {showOptions && (
              <div className="absolute bottom-0 right-0 translate-x-20 w-44 flex flex-col space-y-1 z-50">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="w-full text-xs bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-1 rounded shadow hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  View Profile Picture
                </button>

                {isOwnProfile && (
                  <label className="w-full text-xs bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-1 rounded shadow text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 relative overflow-hidden flex items-center justify-center gap-1">
                    <Camera className="w-3 h-3" />
                    Change Profile Picture
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleChangeDP}
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Name & Position */}
          <div className="mt-4 sm:mt-2 text-center sm:text-left">
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {fullName || "-----"}
                </h2>
                {/* Status Indicator */}
                <span
                  className={`h-3 w-3 rounded-full ${isActive === "1" ? "bg-green-500" : "bg-red-500"
                    }`}
                  title={isActive === "1" ? "Active" : "Inactive"}
                ></span>
              </div>


              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {position || "-----"} <span className="mx-1 text-xs font-light text-gray-500 dark:text-gray-400">&#8226;</span> {department || "-----"}
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Additional Details */}
      <div className="px-4 sm:px-6 pb-6 mt-4 space-y-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200">{email || "-----"}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200">{mobileNumber || "-----"}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200">  {province ? toTitleCase(province) : "-----"}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarDays className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200">
            Date Hired: {dateHired
              ? new Date(dateHired).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "2-digit",
              })
              : "-----"}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <UserRound className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200">Employee No.: {employeeNumber || "-----"}</span>
        </div>
      </div>

      {/* Modals */}
      <ImagePreview
        src={profilePicture || DefaultAvatar}
        alt="Profile Picture"
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <ImagePreview
        src={coverPicture || DefaultCover}
        alt="Cover Photo"
        show={showCoverModal}
        onClose={() => setShowCoverModal(false)}
      />
    </div>
  );
}

function toTitleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
