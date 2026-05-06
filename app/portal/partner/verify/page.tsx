import { verifyEmail } from '@/lib/actions/auth';
import Link from 'next/link';

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token } = await searchParams;

  if (!token || typeof token !== 'string') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h1>
            <p className="text-gray-600 mb-6">The verification link is invalid or missing.</p>
            <Link href="/portal/partner" className="text-blue-600 hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  const result = await verifyEmail(token);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {result.success ? (
            <>
                <h1 className="text-2xl font-bold text-green-600 mb-4">Account Activated!</h1>
                <p className="text-gray-600 mb-6">{result.message}</p>
                <Link 
                    href="/partner/login" 
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Login to Dashboard
                </Link>
            </>
        ) : (
            <>
                <h1 className="text-2xl font-bold text-red-600 mb-4">Activation Failed</h1>
                <p className="text-gray-600 mb-6">{result.message}</p>
                <p className="text-sm text-gray-400">The link may have expired or is invalid.</p>
            </>
        )}
      </div>
    </div>
  );
}
