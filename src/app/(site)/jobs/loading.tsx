import { Container } from "@/components/ui/misc";
import { ListSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <div className="border-b border-line">
        <Container className="py-12 sm:py-16">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-4 h-10 w-72" />
          <Skeleton className="mt-8 h-16 max-w-4xl rounded-full" />
        </Container>
      </div>
      <Container className="grid gap-8 py-10 lg:grid-cols-[260px_1fr] lg:gap-12">
        <Skeleton className="hidden h-72 lg:block" />
        <ListSkeleton rows={5} />
      </Container>
    </>
  );
}
