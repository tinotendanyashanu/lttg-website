import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import EditProfileForm from '@/components/portal/profile/EditProfileForm';
import ProfileImageUpload from '@/components/portal/profile/ProfileImageUpload';

export default async function ProfilePage() {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) redirect('/');

  const account = await getAccountByEmail(session.user.email);
  if (!account) redirect('/');


  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Hero Banner & Profile Header */}
      <div className="bg-white dark:bg-[#27272a] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Banner with modern gradient and pattern overlay */}
        <div className="h-48 bg-linear-to-r from-brand-primary/80 via-brand-secondary/80 to-brand-primary/80 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.4)_1px,transparent_0)] bg-size-[24px_24px]"></div>
        </div>
        
        <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end -mt-16 gap-6 relative">
          {/* Profile Picture */}
          <div className="w-32 h-32 rounded-3xl border-4 border-white dark:border-[#27272a] bg-gray-100 dark:bg-gray-800 shadow-md flex items-center justify-center overflow-hidden shrink-0 relative group">
            {account.profileImageUrl ? (
              <Image src={account.profileImageUrl} alt="Profile" width={128} height={128} className="object-cover w-full h-full transition-transform group-hover:scale-105" />
            ) : (
              <span className="material-icons-outlined text-6xl text-gray-400">person</span>
            )}
            {/* Quick overlay for image upload (optional visual hint) */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="material-icons-outlined text-white text-2xl">photo_camera</span>
            </div>
          </div>
          
          <div className="text-center md:text-left flex-1 pt-4 md:pt-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {account.fullName || session.user.name || 'User Profile'}
            </h1>
            <p className="text-lg text-brand-primary dark:text-brand-primary/90 font-medium mt-1">
              {account.jobTitle || 'No Title Set'} {account.department ? ` • ${account.department}` : ''}
            </p>
            {account.location && (
               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center md:justify-start gap-1">
                 <span className="material-icons-outlined text-sm">location_on</span>
                 {account.location}
               </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-2">
            {account.roles.map((role: string) => (
              <span key={role} className="px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-xl text-sm font-bold uppercase tracking-wider">
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Contact info & Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#27272a] rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Contact Info</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="material-icons-outlined text-gray-400 mt-0.5">email</span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
                  <p className="font-medium text-gray-900 dark:text-white break-all">{session.user.email}</p>
                </div>
              </div>
              
              {account.phoneNumber && (
                <div className="flex items-start gap-3">
                  <span className="material-icons-outlined text-gray-400 mt-0.5">phone</span>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{account.phoneNumber}</p>
                  </div>
                </div>
              )}
            </div>
            
            <hr className="my-6 border-gray-100 dark:border-gray-800" />
            
            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Account Status</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="material-icons-outlined text-gray-400 mt-0.5">calendar_today</span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Joined</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(account.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-icons-outlined text-gray-400 mt-0.5">verified_user</span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <p className="font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Active
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#27272a] rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Update Picture</h2>
            <ProfileImageUpload
              currentImageUrl={account.profileImageUrl}
              fullName={account.fullName}
            />
          </div>
        </div>

        {/* Right Column: Bio & Editing */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#27272a] rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About Me</h2>
            {account.bio ? (
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {account.bio}
              </p>
            ) : (
              <div className="text-center py-8">
                <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">person_outline</span>
                <p className="text-gray-500 dark:text-gray-400">No biography provided yet. Update your profile below to tell your team more about yourself.</p>
              </div>
            )}
          </div>

          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#27272a] rounded-3xl p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile Details</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Keep your professional information up to date.</p>
            </div>
            {/* Convert mongoose document to plain object to pass to Client Component */}
            <EditProfileForm account={JSON.parse(JSON.stringify(account))} />
          </div>
        </div>
      </div>
    </div>
  );
}
