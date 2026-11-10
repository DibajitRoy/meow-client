import SitterBookingList from "@/components/sitter/SitterBookingList";

export default function SitterBookingsPage() {
  return (
    <SitterBookingList
      title="My Bookings"
      subtitle="All your bookings in one place"
      tabs={[
        ["", "All"],
        ["accepted", "Accepted"],
        ["completed", "Completed"],
        ["cancelled", "Cancelled"],
        ["rejected", "Rejected"],
      ]}
      emptyTitle="No bookings here"
      emptyText="Accepted and finished bookings will show up in this list."
    />
  );
}