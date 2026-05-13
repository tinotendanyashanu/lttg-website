import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';

async function getOnboardingStatus(clientId: string) {
  try {
    await dbConnect();
    const { Account } = await import('@/models/Account');
    const { ClientCase } = await import('@/models/ClientCase');
    const { ClientEvidence } = await import('@/models/ClientEvidence');

    const [user, caseCount, evidenceCount] = await Promise.all([
      Account.findById(clientId, { name: 1, clientProfile: 1 }).lean(),
      ClientCase.countDocuments({ clientId }),
      ClientEvidence.countDocuments({ clientId }),
    ]);

    return {
      profileComplete: !!(user as any)?.clientProfile?.companyName,
      hasCase: caseCount > 0,
      hasEvidence: evidenceCount > 0,
      passwordSetupDone: !(user as any)?.passwordSetupRequired,
    };
  } catch (_) {
    return { profileComplete: false, hasCase: false, hasEvidence: false, passwordSetupDone: true };
  }
}

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const status = await getOnboardingStatus(session.user.id);

  const steps = [
    {
      title: 'Account Created',
      desc: 'Welcome to the LeoTech client portal.',
      done: true,
      href: null,
      cta: null,
    },
    {
      title: 'Set Your Password',
      desc: 'Secure your account with a password.',
      done: status.passwordSetupDone,
      href: '/portal/setup-password',
      cta: 'Set Password',
    },
    {
      title: 'Complete Your Profile',
      desc: 'Add your company name and contact details.',
      done: status.profileComplete,
      href: '/portal/client/settings/company',
      cta: 'Complete Profile',
    },
    {
      title: 'Review Your Case',
      desc: 'Check the details of your assigned case.',
      done: status.hasCase,
      href: '/portal/client/cases',
      cta: 'View Cases',
    },
    {
      title: 'Upload Evidence',
      desc: 'Add your first piece of evidence to your case.',
      done: status.hasEvidence,
      href: '/portal/client/evidence/upload',
      cta: 'Upload Evidence',
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Progress header */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Getting Started</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {completedCount} of {steps.length} steps complete
            </p>
          </div>
          <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900 dark:text-white">{progress}%</span>
          </div>
        </div>
        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border p-5 flex items-center gap-4 ${
              step.done
                ? 'border-green-100 dark:border-green-900/30'
                : 'border-gray-100 dark:border-gray-800'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                step.done
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              {step.done ? (
                <span className="material-icons-outlined text-green-600 dark:text-green-400 text-[18px]">
                  check_circle
                </span>
              ) : (
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{i + 1}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-semibold ${
                  step.done
                    ? 'text-gray-400 dark:text-gray-500 line-through'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {step.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
            </div>
            {!step.done && step.href && step.cta && (
              <Link
                href={step.href}
                className="inline-flex items-center gap-1.5 bg-[#2F2F2F] hover:bg-[#4a4a4a] text-white rounded-full px-4 py-2 text-xs font-medium transition-colors shrink-0"
              >
                {step.cta}
                <span className="material-icons-outlined text-[12px]">arrow_forward</span>
              </Link>
            )}
          </div>
        ))}
      </div>

      {progress === 100 && (
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl p-6 text-center">
          <span className="material-icons-outlined text-green-600 dark:text-green-400 text-4xl block mb-2">
            celebration
          </span>
          <p className="font-bold text-green-800 dark:text-green-400">
            You're all set!
          </p>
          <p className="text-sm text-green-700 dark:text-green-500 mt-1">
            Your portal is fully configured. Head to your dashboard to track your case.
          </p>
          <Link
            href="/portal/client/dashboard"
            className="inline-flex items-center gap-2 mt-4 bg-[#2F2F2F] hover:bg-[#4a4a4a] text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
