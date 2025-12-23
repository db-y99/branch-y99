import AppLayout from "@/components/app-layout";
import ApplicationContent from "@/components/application-content";
import ProtectedRoute from "@/components/protected-route";

export default function Home() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <ApplicationContent />
      </AppLayout>
    </ProtectedRoute>
  );
}
