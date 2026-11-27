import DigitalReceiptCard from "../../(components)/digital-receipt-card";

type ReceiptSearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export default async function ReceiptPage({
  searchParams,
}: {
  searchParams: ReceiptSearchParams;
}) {
  const params = await searchParams;
  const getParam = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return (
    <DigitalReceiptCard
      amount={getParam("amount")}
      assessments={getParam("assessments")}
      date={getParam("date")}
      household={getParam("household")}
      homeowner={getParam("homeowner")}
      method={getParam("method")}
      receipt={getParam("receipt")}
      status={getParam("status")}
    />
  );
}
