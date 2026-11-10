import SitterBookingList from "@/components/sitter/SitterBookingList";

export default function SitterRequestsPage() {
  return (
    <SitterBookingList
      title="Booking Requests"
      subtitle="Review and respond to new requests"
      tabs={[["pending", "Pending"]]}
      emptyTitle="No pending requests"
      emptyText="New booking requests from owners will appear here."
    />
  );
}