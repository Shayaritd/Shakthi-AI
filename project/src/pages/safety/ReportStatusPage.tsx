import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSafetyReportByTicket } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  ArrowLeft,
  AlertTriangle,
  FileText,
  UserCheck,
  PhoneCall
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { SafetyReport } from '@/types';

export default function ReportStatusPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [inputTicketId, setInputTicketId] = useState('');
  const [report, setReport] = useState<SafetyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (ticketId) {
      fetchReport(ticketId);
    } else {
      setReport(null);
      setSearched(false);
    }
  }, [ticketId]);

  const fetchReport = async (tid: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const data = await getSafetyReportByTicket(tid.trim().toUpperCase());
      setReport(data);
      if (!data) {
        toast.error("Safety report ticket not found.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch report status.");
    } finally {
      setLoading(false);
    }
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTicketId.trim()) {
      toast.error("Please enter a ticket ID.");
      return;
    }
    navigate(`/safety/report/${inputTicketId.trim().toUpperCase()}`);
  };

  // Helper to determine status style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Submitted</Badge>;
      case 'UNDER_REVIEW':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Under Review</Badge>;
      case 'RESOLVED':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'LOW':
        return <Badge variant="secondary" className="text-teal-700">Low</Badge>;
      case 'NORMAL':
        return <Badge variant="secondary" className="text-blue-700">Normal</Badge>;
      case 'HIGH':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>;
      case 'CRITICAL':
        return <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse">Critical</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link to="/safety">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Safety Report Status</h1>
          <p className="text-sm text-gray-500">Track and view safety investigation details</p>
        </div>
      </div>

      {/* Ticket Lookup Card (if not viewing a valid report) */}
      {(!ticketId || (searched && !report)) && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5 text-teal-600" />
              Lookup Ticket ID
            </CardTitle>
            <CardDescription>
              Enter the unique SHK ticket code provided after your submission (e.g. SHK-2026-12345)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookupSubmit} className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Input
                  placeholder="SHK-YYYY-XXXXX"
                  value={inputTicketId}
                  onChange={(e) => setInputTicketId(e.target.value)}
                  className="font-mono text-center uppercase tracking-wider"
                />
              </div>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
                Track Report
              </Button>
            </form>

            {searched && !report && !loading && (
              <div className="mt-4 p-4 bg-red-50 text-red-800 border border-red-150 rounded-lg flex gap-3 text-sm">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Ticket not found</p>
                  <p className="mt-1">
                    Please verify the ID format and try again. Support tickets submitted via the Help Center are also tracked here.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card className="py-12 flex flex-col items-center justify-center text-center">
          <CardContent className="space-y-3">
            <Clock className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
            <p className="text-gray-500 text-sm">Fetching report history...</p>
          </CardContent>
        </Card>
      )}

      {/* Report Timeline & Details */}
      {report && !loading && (
        <>
          <Card className="shadow-md border-teal-50">
            <CardHeader className="border-b bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-mono text-base tracking-wider text-teal-800">
                    {report.ticket_id}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Submitted on {format(new Date(report.created_at), 'MMMM dd, yyyy @ h:mm a')}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(report.status)}
                  {getSeverityBadge(report.severity)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Category & Description */}
              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 text-sm">Report Overview</h3>
                <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-700 space-y-2">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-gray-500">Category</span>
                    <span className="font-bold text-teal-700">{report.category}</span>
                  </div>
                  <div className="pt-2">
                    <span className="font-semibold text-gray-500 block mb-1">Details Provided:</span>
                    <p className="whitespace-pre-line italic">"{report.description}"</p>
                  </div>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="space-y-4 pt-2">
                <h3 className="font-bold text-gray-900 text-sm">Investigation Timeline</h3>
                
                <div className="relative border-l-2 border-teal-200 ml-3 pl-6 space-y-6">
                  {/* Timeline Stage 1: Submitted */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 rounded-full bg-teal-600 p-1 flex items-center justify-center text-white">
                      <FileText className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <h4 className="font-bold text-teal-900 text-sm">Report Submitted</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {format(new Date(report.created_at), 'MMM dd, h:mm a')}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Report has been successfully logged. An investigator is automatically assigned to review the profiles.
                      </p>
                    </div>
                  </div>

                  {/* Timeline Stage 2: Under Review */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0 rounded-full p-1 flex items-center justify-center text-white ${
                      report.status === 'UNDER_REVIEW' || report.status === 'RESOLVED' ? 'bg-amber-500' : 'bg-gray-300'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                    </span>
                    <div className={report.status === 'SUBMITTED' ? 'opacity-50' : ''}>
                      <h4 className="font-bold text-sm text-gray-900">Under Investigation</h4>
                      {report.status !== 'SUBMITTED' && (
                        <p className="text-xs text-gray-500 mt-0.5">Assigned to safety officer</p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">
                        We are auditing relevant messaging histories, verification credentials, and code of conduct compliance.
                      </p>
                    </div>
                  </div>

                  {/* Timeline Stage 3: Resolved */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0 rounded-full p-1 flex items-center justify-center text-white ${
                      report.status === 'RESOLVED' ? 'bg-green-600' : 'bg-gray-300'
                    }`}>
                      <UserCheck className="w-3.5 h-3.5" />
                    </span>
                    <div className={report.status !== 'RESOLVED' ? 'opacity-50' : ''}>
                      <h4 className="font-bold text-sm text-gray-900">Case Resolved</h4>
                      {report.status === 'RESOLVED' && report.resolved_at && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Resolved on {format(new Date(report.resolved_at), 'MMM dd, h:mm a')}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">
                        Resolution action taken. Necessary notifications sent to guardians/institutions if code violations occurred.
                      </p>
                      {report.status === 'RESOLVED' && report.resolution_notes && (
                        <div className="mt-2 p-2 bg-emerald-50 text-emerald-800 rounded border border-emerald-150 text-xs">
                          <strong>Resolution Notes:</strong> {report.resolution_notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Recommendations */}
          <Card className="border-teal-100 bg-teal-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-teal-900">
                <Shield className="w-4 h-4 text-teal-600" />
                Immediate Safety Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-teal-950 space-y-2 leading-relaxed">
              <p>1. <strong>Block User</strong>: You can block this contact at any time directly in the Chat interface to mute all communications.</p>
              <p>2. <strong>Parent Involvement</strong>: For athletes under 18, details of active investigations can also be requested by verified guardians.</p>
              <p>3. <strong>Helplines</strong>: If you feel unsafe or require counseling support, contact the national helpline at <span className="font-bold text-teal-700">112</span> or <span className="font-bold text-teal-700">1091 (Women Helpline)</span>.</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
