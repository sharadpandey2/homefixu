export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id: string }>;
}) {
  const params = await searchParams;
  const session_id = params.session_id;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 font-bold text-2xl">Payment Successful!</h1>
      <p className="mb-4 text-gray-600">
        Thank you for your purchase. Your payment has been processed
        successfully.
      </p>
      {session_id && (
        <p className="text-gray-500 text-sm">Session ID: {session_id}</p>
      )}
    </div>
  );
}
