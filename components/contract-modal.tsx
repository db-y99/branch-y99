"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tabs,
  Tab,
  addToast,
  useDisclosure,
} from "@heroui/react";
import { Download, FileText, AlertTriangle } from "lucide-react";
import type {
  Contract,
  ContractDocument as ContractDocumentType,
} from "@/types";

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  loginId: number;
  applicationCode: string;
}

export default function ContractModal({
  isOpen,
  onClose,
  contract,
  loginId,
  applicationCode,
}: ContractModalProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const publicUrl = process.env.NEXT_PUBLIC_URL;
  const [selectedDocument, setSelectedDocument] =
    useState<ContractDocumentType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();

  const documents = contract?.document ?? [];

  // Update selected document when contract changes
  React.useEffect(() => {
    if (documents.length > 0) {
      setSelectedDocument(documents[0]);
    }
  }, [contract?.id]);

  if (!contract) return null;

  const getContractUrl = (filename: string) => {
    // Use absolute URL for @pdf-viewer/react
    if (typeof window !== "undefined") {
      return `/api/download-contract?filename=${encodeURIComponent(filename)}`;
    }
    return `${apiUrl}/download-contract/${filename}?login=${loginId}`;
  };

  const getDownloadUrl = (filename: string) => {
    return `/api/download-contract?filename=${encodeURIComponent(filename)}`;
  };

  const handleDownload = (doc: ContractDocumentType) => {
    const url = getDownloadUrl(doc.pdf);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = doc.pdf;
    a.click();
  };

  const handleCreateContract = async () => {
    setIsCreating(true);
    try {
      const response = await fetch(
        `/api/contract/create?code=${applicationCode}&loginId=${loginId}`
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create contract");
      }
      addToast({
        title: "Tạo hợp đồng thành công",
        description: "Hợp đồng đã được tạo thành công",
        color: "success",
      });
      onClose();
    } catch (error: any) {
      console.error("Error creating contract:", error);
      alert(error.message || "Có lỗi xảy ra khi tạo hợp đồng");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        scrollBehavior="inside"
        size="5xl"
        onClose={isCreating ? undefined : onClose}
        isDismissable={!isCreating}
        hideCloseButton={isCreating}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <FileText size={20} />
                  <span>Hợp đồng - {contract.content}</span>
                </div>
              </ModalHeader>
              <ModalBody className="p-0">
                {documents.length > 0 ? (
                  <div className="flex flex-col h-[70vh]">
                    {/* Document Tabs */}
                    <div className="border-b border-default-200 px-4 pt-2 mb-2">
                      <Tabs
                        selectedKey={selectedDocument?.code || ""}
                        onSelectionChange={(key) => {
                          const doc = documents.find((d) => d.code === key);
                          if (doc) setSelectedDocument(doc);
                        }}
                        variant="underlined"
                        classNames={{
                          tabList:
                            "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                          cursor: "w-full",
                          tab: "max-w-fit px-0 h-12",
                          tabContent: "group-data-[selected=true]:text-primary",
                        }}
                      >
                        {documents.map((doc) => (
                          <Tab
                            key={doc.code}
                            title={
                              <div className="flex items-center gap-2">
                                <span>{doc.name}</span>
                              </div>
                            }
                          />
                        ))}
                      </Tabs>
                    </div>

                    {/* PDF Viewer */}
                    <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
                      {typeof window !== "undefined" && selectedDocument ? (
                        <div className="flex-1 w-full h-full">
                          <iframe
                            src={getContractUrl(selectedDocument.pdf)}
                            width="100%"
                            height="100%"
                            title="Contract"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-default-400">
                          {selectedDocument
                            ? "Đang tải PDF..."
                            : "Không có file PDF"}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[50vh] text-default-400">
                    Không có tài liệu hợp đồng
                  </div>
                )}
                <div className="flex items-center justify-center text-primary font-bold text-2xl">
                  {contract.status__name}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="success"
                  variant="solid"
                  isDisabled={isCreating}
                  onPress={() =>
                    window.open(
                      `${publicUrl}/contract/${contract.link}`,
                      "_blank"
                    )
                  }
                >
                  Mở link hợp đồng
                </Button>
                <Button
                  color="secondary"
                  variant="ghost"
                  isDisabled={isCreating}
                  isLoading={isCreating}
                  onPress={onConfirmOpen}
                >
                  Tạo lại hợp đồng
                </Button>
                {selectedDocument && (
                  <Button
                    color="primary"
                    startContent={<Download size={16} />}
                    variant="flat"
                    isDisabled={isCreating}
                    onPress={() => handleDownload(selectedDocument)}
                  >
                    Tải xuống
                  </Button>
                )}
                <Button
                  color="danger"
                  variant="light"
                  isDisabled={isCreating}
                  onPress={onClose}
                >
                  Đóng
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Confirm Modal */}
      {isConfirmOpen && (
        <Modal
          isOpen={isConfirmOpen}
          onClose={onConfirmClose}
          size="md"
          isDismissable={!isCreating}
          hideCloseButton={isCreating}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-warning" size={20} />
                    <span>Xác nhận tạo lại hợp đồng</span>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <p>
                    Bạn có chắc chắn muốn tạo lại hợp đồng cho đơn vay{" "}
                    <strong>{applicationCode}</strong> không?
                  </p>
                  <p className="text-sm text-default-500">
                    Hành động này sẽ tạo lại hợp đồng mới và có thể ghi đè hợp
                    đồng hiện tại.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={onClose}
                    isDisabled={isCreating}
                  >
                    Hủy
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleCreateContract}
                    isLoading={isCreating}
                    isDisabled={isCreating}
                  >
                    {isCreating ? "Đang tạo..." : "Xác nhận"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
