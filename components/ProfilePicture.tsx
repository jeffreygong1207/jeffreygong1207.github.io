import Image from "next/image";

export default function ProfilePicture() {
  return (
    <div className="flex-shrink-0 mx-auto md:mx-0">
      <Image
        src="/images/profile.jpg"
        alt="Profile Picture"
        width={200}
        height={200}
        className="rounded-full object-cover w-32 h-32 md:w-48 md:h-48"
        priority
      />
    </div>
  );
}
