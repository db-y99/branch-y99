import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Image,
  useDisclosure,
} from "@heroui/react";
import { Download } from "lucide-react";
import useSWR from "swr";

import {
  Application,
  ApplicationFile,
  ApplicationFileListResponse,
  DocumentTypeListResponse,
} from "@/types";
import {
  APPLICATION_FILE_TYPE_MAP,
  APPLICATION_STATUS_MAP,
} from "@/utils/constants";
import { fetcher } from "@/utils/fetcher";
import { getFileUrl, formatDateTimeVN } from "@/utils/functions";
import ShowImageModal from "@/components/show-image-modal";

interface ApplicationModalProps {
  application: Application;
  loginId: number;
  isOpen: boolean;
  onClose: () => void;
}

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1 py-1">
    <div className="text-sm text-default-500">{label}</div>
    <div className="font-medium">
      {value ?? <span className="text-default-400">/</span>}
    </div>
  </div>
);

export default function ApplicationModal({
  application,
  isOpen,
  onClose,
  loginId,
}: ApplicationModalProps) {
  const {
    isOpen: isImageViewerOpen,
    onOpen: onImageViewerOpen,
    onClose: onImageViewerClose,
  } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageAlt, setSelectedImageAlt] = useState<string>("");
  const [selectedImagePath, setSelectedImagePath] = useState<string | null>(
    null
  );

  const { data: applicationFiles } = useSWR<ApplicationFileListResponse>(
    application.id
      ? `/api/application-file?ref=${application.id}&loginId=${loginId}`
      : null,
    fetcher
  );

  const { data: documentTypes } = useSWR<DocumentTypeListResponse>(
    `/api/document-type?loginId=${loginId}`,
    fetcher
  );

  const handleImageClick = (
    imageUrl: string,
    alt: string,
    filePath?: string
  ) => {
    setSelectedImage(imageUrl);
    setSelectedImageAlt(alt);
    setSelectedImagePath(filePath || null);
    onImageViewerOpen();
  };

  const handleCloseImageViewer = () => {
    onImageViewerClose();
    setSelectedImage(null);
    setSelectedImageAlt("");
    setSelectedImagePath(null);
  };

  const handleDownloadAllFiles = async (
    files: ApplicationFile[],
    folderName?: string
  ) => {
    const filePaths = files
      .map((file) => file.file__file)
      .filter((path): path is string => !!path);

    if (filePaths.length === 0) return;

    try {
      const response = await fetch("/api/download-zip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filePaths,
          loginId,
          folderName: folderName || "files.zip",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create zip file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = folderName || "files.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      // Error downloading zip file
    }
  };

  const files = applicationFiles?.rows || [];
  const docTypes = documentTypes?.rows || [];

  // Group files by document type code (one doc type can have multiple files)
  const filesByDocType = new Map<string, ApplicationFile[]>();

  files.forEach((file) => {
    const code = file.file__doc_type__code;

    if (!filesByDocType.has(code)) {
      filesByDocType.set(code, []);
    }
    filesByDocType.get(code)!.push(file);
  });

  // Get files for the first 3 document types (for the top section)
  const primaryDocTypes = [
    {
      code: APPLICATION_FILE_TYPE_MAP.CCCD_MT,
      label: "Mặt trước CCCD",
      alt: "Mặt trước CCCD",
    },
    {
      code: APPLICATION_FILE_TYPE_MAP.CCCD_MS,
      label: "Mặt sau CCCD",
      alt: "Mặt sau CCCD",
    },
    {
      code: APPLICATION_FILE_TYPE_MAP.AVATAR,
      label: "Ảnh chân dung",
      alt: "Ảnh chân dung",
    },
  ].map((item) => ({
    ...item,
    file: (filesByDocType.get(item.code) || [])[0],
  }));

  // Get document types that have files (excluding the first 3)
  const docTypeMap = new Map(docTypes.map((dt) => [dt.code, dt]));
  const otherDocTypesWithFiles = Array.from(filesByDocType.entries())
    .filter(
      ([code]) =>
        code !== APPLICATION_FILE_TYPE_MAP.CCCD_MT &&
        code !== APPLICATION_FILE_TYPE_MAP.CCCD_MS &&
        code !== APPLICATION_FILE_TYPE_MAP.AVATAR
    )
    .map(([code, files]) => ({
      docType: docTypeMap.get(code),
      files,
      code,
    }))
    .filter((item) => item.docType) // Only include if docType exists
    .sort((a, b) => (a.docType?.index || 0) - (b.docType?.index || 0));

  return (
    <>
      <Modal isOpen={isOpen} size={"5xl"} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Chi tiết đơn vay
              </ModalHeader>
              <ModalBody className="max-h-[70vh] overflow-y-auto">
                {/* ===== THÔNG TIN ===== */}
                <div className="space-y-4">
                  <div className="text-lg font-semibold">Thông tin</div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2">
                    <InfoRow label="Mã đơn vay" value={application.code} />
                    <InfoRow label="Họ tên" value={application.fullname} />
                    <InfoRow
                      label="Mã khách hàng"
                      value={application.customer}
                    />
                    <InfoRow label="Điện thoại" value={application.phone} />

                    <InfoRow
                      label="Giới tính"
                      value={application.sex === 1 ? "Nam" : "Nữ"}
                    />
                    <InfoRow
                      label="Giấy tờ tùy thân"
                      value="Căn cước công dân"
                    />
                    <InfoRow label="Mã số" value={application.legal_code} />
                    <InfoRow label="Ngày cấp" value={application.issue_date} />

                    <InfoRow label="Nơi cấp" value={application.issue_place} />
                    <InfoRow label="Quốc gia" value="Việt Nam" />

                    <InfoRow
                      label="Tỉnh/Thành phố"
                      value={application.province}
                    />
                    <InfoRow label="Quận/Huyện" value={application.district} />
                    <InfoRow label="Địa chỉ" value={application.address} />

                    <InfoRow label="Loại sản phẩm" value="Cầm đồ" />
                    <InfoRow label="Tài sản cầm cố" value="Điện thoại" />
                    <InfoRow
                      label="Số tiền vay"
                      value={`${application.loan_amount.toLocaleString()} VNĐ`}
                    />
                    <InfoRow
                      label="Kỳ hạn"
                      value={`${application.loan_term} tháng`}
                    />

                    <InfoRow
                      label="Số tiền cho vay"
                      value={
                        application.approve_amount
                          ? `${application.approve_amount.toLocaleString()} VNĐ`
                          : "/"
                      }
                    />
                    <InfoRow
                      label="Thời hạn vay"
                      value={
                        application.approve_term
                          ? `${application.approve_term} tháng`
                          : "/"
                      }
                    />

                    <InfoRow
                      label="Trạng thái đơn vay"
                      value={`${application.status}. ${APPLICATION_STATUS_MAP[application.status]?.label || ""}`}
                    />

                    <InfoRow
                      label="Người tạo"
                      value={application.creator__fullname || "/"}
                    />
                    <InfoRow
                      label="Thời gian tạo"
                      value={
                        application.create_time
                          ? formatDateTimeVN(application.create_time)
                          : "/"
                      }
                    />
                    <InfoRow
                      label="Người cập nhật"
                      value={application.updater__fullname || "/"}
                    />
                    <InfoRow
                      label="Thời gian cập nhật"
                      value={
                        application.update_time
                          ? formatDateTimeVN(application.update_time)
                          : "/"
                      }
                    />
                    <InfoRow
                      label="Người duyệt"
                      value={application.approver__fullname || "/"}
                    />
                    <InfoRow
                      label="Thời gian duyệt"
                      value={
                        application.approve_time
                          ? formatDateTimeVN(application.approve_time)
                          : "/"
                      }
                    />
                    <InfoRow label="Được ký bởi" value="/" />
                    <InfoRow label="Thời gian ký hợp đồng" value="/" />
                  </div>
                </div>

                {/* ===== HỒ SƠ ===== */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-semibold">Hồ sơ</div>
                    <Button
                      color="primary"
                      size="sm"
                      startContent={<Download size={16} />}
                      variant="flat"
                      onPress={() => {
                        const allPrimaryFiles = primaryDocTypes
                          .map((item) => item.file)
                          .filter(
                            (file): file is ApplicationFile =>
                              file !== undefined
                          );

                        if (allPrimaryFiles.length > 0) {
                          handleDownloadAllFiles(allPrimaryFiles, "Ho-so.zip");
                        }
                      }}
                    >
                      Tải tất cả
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {primaryDocTypes.map((item) => (
                      <div
                        key={item.code}
                        className="flex flex-col items-center"
                      >
                        <div className="w-full h-40 sm:h-48 bg-gray-100 border border-gray-300 rounded overflow-hidden flex items-center justify-center cursor-pointer">
                          {item.file?.file__file ? (
                            <Image
                              isZoomed
                              alt={item.alt}
                              src={getFileUrl(item.file.file__file)}
                              width={300}
                              onClick={() => {
                                if (item.file?.file__file) {
                                  const imageUrl = getFileUrl(
                                    item.file.file__file
                                  );

                                  if (imageUrl) {
                                    handleImageClick(
                                      imageUrl,
                                      item.alt,
                                      item.file.file__file
                                    );
                                  }
                                }
                              }}
                            />
                          ) : (
                            <span className="text-default-400 text-sm">
                              Chưa có file
                            </span>
                          )}
                        </div>
                        <span className="mt-2 text-sm text-center">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tất cả các loại tài liệu khác */}
                  {otherDocTypesWithFiles.length > 0 && (
                    <div className="mt-6">
                      <div className="text-lg font-semibold mb-4">
                        Tất cả tài liệu
                      </div>
                      <div className="space-y-6">
                        {otherDocTypesWithFiles.map(
                          ({ docType, files: docFiles }) => {
                            if (!docType) return null;

                            return (
                              <div key={docType.id} className="space-y-2 mb-4">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium text-default-700">
                                    {docType.name}
                                  </div>
                                  {docFiles.length > 0 && (
                                    <Button
                                      color="primary"
                                      size="sm"
                                      startContent={<Download size={14} />}
                                      variant="flat"
                                      onPress={() =>
                                        handleDownloadAllFiles(
                                          docFiles,
                                          `${docType.name.replace(/[^a-zA-Z0-9]/g, "_")}.zip`
                                        )
                                      }
                                    >
                                      Tải tất cả
                                    </Button>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {docFiles.map((file) => (
                                    <div
                                      key={file.id}
                                      className="flex flex-col items-center"
                                    >
                                      <div className="w-full h-40 sm:h-48 bg-gray-100 border border-gray-300 rounded overflow-hidden flex items-center justify-center cursor-pointer">
                                        {file.file__file ? (
                                          <Image
                                            isZoomed
                                            alt={docType.name}
                                            src={getFileUrl(file.file__file)}
                                            width={300}
                                            onClick={() => {
                                              if (file.file__file) {
                                                const imageUrl = getFileUrl(
                                                  file.file__file
                                                );

                                                if (imageUrl) {
                                                  handleImageClick(
                                                    imageUrl,
                                                    `${docType.name} - ${file.file__name || "File"}`,
                                                    file.file__file
                                                  );
                                                }
                                              }
                                            }}
                                          />
                                        ) : (
                                          <span className="text-default-400 text-sm">
                                            Chưa có file
                                          </span>
                                        )}
                                      </div>
                                      <span className="mt-2 text-xs text-center text-default-500">
                                        {file.file__name || "File"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Đóng
                </Button>
                <Button color="primary" onPress={onClose}>
                  Lưu
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Image Viewer Modal */}
      {isImageViewerOpen && selectedImage && (
        <ShowImageModal
          imageAlt={selectedImageAlt}
          imagePath={selectedImagePath}
          imageUrl={selectedImage}
          isOpen={isImageViewerOpen}
          loginId={loginId}
          onClose={handleCloseImageViewer}
        />
      )}
    </>
  );
}
