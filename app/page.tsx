"use client";
import { useWalletNfts } from "@/hooks/useWalletNfts";
import { Nft } from "@metaplex-foundation/js";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useState } from "react";
// import Image from 'next/image';


// Dynamically import components
const NftSelect = dynamic(() => import("./components/NftSelect"), {
  ssr: false,
});

export default function Home() {
  const { connected, publicKey } = useWallet();
  // const [publicKey, setPublicKey] = useState<PublicKey | undefined>();
  const { nfts, loading } = useWalletNfts(publicKey || undefined);
  const [selectedNfts, setSelectedNfts] = useState<Nft[]>([]);

  return (
    <div className="m-auto flex w-full flex-col items-center space-y-10 py-10 xl:w-1/2">
      
      {/*<div className="flex w-full rounded-md bg-gray-800 px-4 py-2 text-lg text-sky-100">
        <input
          type="text"
          onSubmit={() => setWallet("")}
          className="w-full bg-transparent outline-none"
          placeholder="Search..."
        />
        <MagnifyingGlassIcon className="h-6 w-6 fill-sky-100" />
      </div>*/}

      <div className="flex w-full flex-col items-center space-y-2">
        {connected && (
          <>
            <h1 className="text-3xl font-bold text-gray-900">NFT Select</h1>
            <NftSelect
              multiple
              text={loading ? "Loading..." : "Select NFTs..."}
              nfts={nfts}
              value={selectedNfts}
              onChange={setSelectedNfts}
              disabled={loading || nfts.length === 0}
            />
          </>
        )}
      </div>
    </div>
  );
}
