type Report = {
  id: string;
  reason: string;
  details: string | null;
  createdAt: string;
  review: {
    id: string;
    text: string;
    status: string;
    instructor: {
      firstName: string;
      lastName: string;
      university: { name: string };
      department: { name: string };
    };
    user: {
      email: string;
    };
  };
  user: {
    email: string;
  } | null;
};

export default async function ReportsPage() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/reports`, { cache: "no-store" });
  const json = await res.json();
  const reports: Report[] = json.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Raporlar ({reports.length})</h1>
      {reports.length === 0 && <p className="text-gray-600">Henüz rapor yok</p>}
      <div className="space-y-6">
        {reports.map((report) => (
          <div key={report.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">
                  {report.review.instructor.firstName} {report.review.instructor.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  {report.review.instructor.university.name} - {report.review.instructor.department.name}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded text-sm ${
                  report.review.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : report.review.status === "hidden"
                    ? "bg-yellow-100 text-yellow-800"
                    : report.review.status === "deleted"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {report.review.status}
              </span>
            </div>

            <div className="mb-3 p-3 bg-gray-50 rounded">
              <p className="text-sm font-medium mb-1">Değerlendirme:</p>
              <p className="text-sm">{report.review.text}</p>
              <p className="text-xs text-gray-500 mt-2">Yazan: {report.review.user.email}</p>
            </div>

            <div className="mb-3">
              <p className="text-sm font-medium mb-1">Rapor Nedeni:</p>
              <p className="text-sm text-red-700">{report.reason}</p>
              {report.details && (
                <p className="text-sm text-gray-600 mt-1">Detaylar: {report.details}</p>
              )}
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>
                Raporlayan:{" "}
                {report.user ? report.user.email : "Anonim"}
              </span>
              <span>{new Date(report.createdAt).toLocaleString("tr-TR")}</span>
            </div>

            <div className="mt-4 flex gap-2">
              <form action={`/api/admin/reviews/${report.review.id}/hide`} method="POST">
                <button
                  type="submit"
                  className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                >
                  Gizle
                </button>
              </form>
              <form action={`/api/admin/reviews/${report.review.id}/delete`} method="POST">
                <button
                  type="submit"
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Sil
                </button>
              </form>
              <form action={`/api/admin/reviews/${report.review.id}/approve`} method="POST">
                <button
                  type="submit"
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  Onayla
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
