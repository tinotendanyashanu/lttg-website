
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Contact from '@/models/Contact';
import Link from 'next/link';
import { 
    ArrowLeft, 
    Mail, 
    Calendar, 
    DollarSign, 
    Clock, 
    MessageSquare,
    User
} from 'lucide-react';
import { redirect } from 'next/navigation';

async function getContact(id: string) {
    await dbConnect();
    const contact = await Contact.findById(id).lean();
    return contact;
}

export default async function AdminContactDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
        redirect('/login');
    }

    const contact = await getContact(params.id);

    if (!contact) {
        return (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800">Submission Not Found</h2>
                <Link href="/admin/contacts" className="text-purple-600 hover:text-purple-700 font-medium mt-4 inline-block">
                    &larr; Return to Contacts
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
             <Link href="/admin/contacts" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors font-medium">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Contacts
            </Link>

            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-8">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex items-start gap-6">
                        <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
                            {contact.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">{contact.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm">
                                <a href={`mailto:${contact.email}`} className="flex items-center hover:text-purple-600 transition-colors">
                                    <Mail className="h-4 w-4 mr-2" />
                                    {contact.email}
                                </a>
                                 <span className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {new Date(contact.createdAt).toLocaleDateString()} at {new Date(contact.createdAt).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content: Message */}
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center">
                            <MessageSquare className="h-5 w-5 mr-3 text-purple-600" />
                            Message Content
                        </h3>
                        <div className="prose prose-slate max-w-none">
                            <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">
                                {contact.message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Details */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Project Details</h3>
                        
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Project Type</p>
                                <p className="text-slate-900 font-medium">{contact.project}</p>
                            </div>

                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <p className="text-xs text-emerald-600 uppercase tracking-wider font-semibold mb-1 flex items-center">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    Budget
                                </p>
                                <p className="text-emerald-900 font-medium">{contact.budget || 'Not specified'}</p>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold mb-1 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Timeline
                                </p>
                                <p className="text-blue-900 font-medium">{contact.timeline || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
