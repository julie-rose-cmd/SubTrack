import PaymentCheckoutCard from "../../(components)/payment-checkout-card";

type CheckoutSearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export default async function PaymentCheckoutPage({
  searchParams,
}: {
  searchParams: CheckoutSearchParams;
}) {
  const params = await searchParams;
  const value = params.assessments;
  const selectedAssessmentIds = Array.isArray(value)
    ? value[0]?.split(",")
    : value?.split(",");

  return (
    <PaymentCheckoutCard selectedAssessmentIds={selectedAssessmentIds} />
  );
}
