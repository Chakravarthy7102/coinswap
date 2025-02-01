import { useWallet } from "@/context/wallet-context";
import { Bird } from "lucide-react";
import AccountDetailsDialog from "./account-details-dialog";

export default function Navbar() {
  const { address, provider, disconnect } = useWallet();
  return (
    <nav className="flex items-center justify-between px-4 md:px-8 py-4 border-b">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <Bird className="text-primary size-7" /> CoinSwap
      </h3>
      {address && provider ? (
        <AccountDetailsDialog
          address={address}
          disconnect={disconnect}
          provider={provider}
        />
      ) : null}
    </nav>
  );
}
