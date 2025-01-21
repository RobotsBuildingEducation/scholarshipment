import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
} from "@chakra-ui/react";
import { useNostrWalletStore } from "../hooks/useNostrWalletStore";
import { IdentityCard } from "./IdentityCard";

export const WalletModal = ({ isOpen, onClose }) => {
  console.log("how???");
  //
  //1+1=3
  const [isInitializingWallet, setIsInitializingWallet] = useState(false);

  //   const isConnected = useNostrWalletStore((state) => state.isConnected);
  const init = useNostrWalletStore((state) => state.init); // Access the init method
  const cashuWallet = useNostrWalletStore((state) => state.cashuWallet); // Access the init method

  const walletBalance = useNostrWalletStore((state) => state.walletBalance); // Access the init method

  useEffect(() => {
    setIsInitializingWallet(true);
    let asyncStart = async () => {
      await init();
      setIsInitializingWallet(false);
    };
    asyncStart();
  }, []);

  if (isInitializingWallet) {
    return <div>hold on</div>;
  }

  const totalBalance =
    (walletBalance || [])?.reduce((sum, b) => sum + (b.amount || 0), 0) || null;

  console.log("total balance", totalBalance);
  console.log("walletBalance", walletBalance);
  console.log("cashuwallet", cashuWallet);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Bitcoin Deposits</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* Add your modal content here */}
          {/* <p>Welcome to the Cash App modal! 🎉</p> */}

          <>
            <IdentityCard
              number={
                // cashuWallet.walletId ||
                "Robots Building Education Wallet"
              }
              name={
                <div>
                  Bitcoin Deposits
                  <div>
                    {"Balance"}: {totalBalance || 0} sats
                  </div>
                </div>
              }
              theme="BTC"
              animateOnChange={false}
              //   realValue={cashuWallet.walletId}
            />
          </>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
