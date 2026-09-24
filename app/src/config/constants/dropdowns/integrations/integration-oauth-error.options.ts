const IntegrationOAuthErrorOptions: { id: string; label: string }[] = [
  { id: "access_denied", label: "Access was not granted, so nothing was connected." },
  { id: "invalid_state", label: "This sign-in link has expired or is not valid. Please start again." },
  { id: "integration_not_found", label: "The connection you were reconnecting no longer exists." },
  {
    id: "token_exchange_failed",
    label: "Access was approved, but we could not finish setting up the connection.",
  },
  { id: "authorization_failed", label: "The sign-in was not completed." },
];

export function getIntegrationOAuthErrorLabel(code: string): string {
  return (
    IntegrationOAuthErrorOptions.find((option) => option.id === code)?.label ??
    "The connection could not be completed."
  );
}
