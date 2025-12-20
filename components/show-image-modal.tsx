import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Image,
} from "@heroui/react";
import { Download } from "lucide-react";

interface ShowImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  imageAlt: string;
  imagePath: string | null;
  loginId: number;
}

export default function ShowImageModal({
  isOpen,
  onClose,
  imageUrl,
  imageAlt,
  imagePath,
  loginId,
}: ShowImageModalProps) {
  const handleDownloadImage = () => {
    if (!imagePath) return;

    // Use API route to download file
    const downloadUrl = `/api/download-file?path=${encodeURIComponent(imagePath)}&loginId=${loginId}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = imagePath.split("/").pop() || imageAlt || "image";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!imageUrl) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {imageAlt}
            </ModalHeader>
            <ModalBody className="flex items-center justify-center p-6">
              <Image
                src={imageUrl}
                alt={imageAlt}
                className="max-w-full max-h-[80vh] object-contain"
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                variant="flat"
                startContent={<Download size={16} />}
                onPress={handleDownloadImage}
              >
                Tải xuống
              </Button>
              <Button color="danger" variant="light" onPress={onClose}>
                Đóng
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
