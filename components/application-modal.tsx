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
import { Application, ApplicationFileListResponse } from "@/types";
import { APPLICATION_STATUS_MAP } from "@/utils/constants";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { getFileUrl } from "@/utils/functions";

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
  console.log(application);

  const { data: applicationFiles } = useSWR<ApplicationFileListResponse>(
    application.id
      ? `/api/application-file?ref=${application.id}&loginId=${loginId}`
      : null,
    fetcher
  );

  const files = applicationFiles?.rows || [];

  const frontIdFile = files.find(
    (file) => file.file__doc_type__code === "cccd-mt"
  );

  const backIdFile = files.find(
    (file) => file.file__doc_type__code === "cccd-ms"
  );

  const avatarFile = files.find(
    (file) => file.file__doc_type__code === "avatar"
  );

  return (
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
                  <InfoRow label="Mã khách hàng" value={application.customer} />
                  <InfoRow label="Điện thoại" value={application.phone} />

                  <InfoRow
                    label="Giới tính"
                    value={application.sex === 1 ? "Nam" : "Nữ"}
                  />
                  <InfoRow label="Giấy tờ tùy thân" value="Căn cước công dân" />
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
                    value={application.creator || "/"}
                  />
                  <InfoRow
                    label="Thời gian tạo"
                    value={application.create_time}
                  />
                  <InfoRow
                    label="Người cập nhật"
                    value={application.updater || "/"}
                  />
                  <InfoRow
                    label="Thời gian cập nhật"
                    value={application.update_time}
                  />
                  <InfoRow
                    label="Người duyệt"
                    value={application.approver || "/"}
                  />
                  <InfoRow
                    label="Thời gian duyệt"
                    value={application.approve_time || "/"}
                  />
                  <InfoRow label="Được ký bởi" value="/" />
                  <InfoRow label="Thời gian ký hợp đồng" value="/" />
                </div>
              </div>

              {/* ===== HỒ SƠ ===== */}
              <div className="mt-6">
                <div className="text-lg font-semibold mb-2">Hồ sơ</div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Mặt trước CCCD */}
                  <div className="flex flex-col items-center">
                    <div className="w-full h-40 sm:h-48 bg-gray-100 border border-gray-300 rounded overflow-hidden flex items-center justify-center">
                      <Image
                        alt="Mặt trước CCCD"
                        src={getFileUrl(frontIdFile?.file__file || "")}
                        width={300}
                      />
                    </div>
                    <span className="mt-2 text-sm text-center">
                      Mặt trước CCCD
                    </span>
                  </div>

                  {/* Mặt sau CCCD */}
                  <div className="flex flex-col items-center">
                    <div className="w-full h-40 sm:h-48 bg-gray-100 border border-gray-300 rounded overflow-hidden flex items-center justify-center">
                      <Image
                        alt="Mặt sau CCCD"
                        src={getFileUrl(backIdFile?.file__file || "")}
                        width={300}
                      />
                    </div>
                    <span className="mt-2 text-sm text-center">
                      Mặt sau CCCD
                    </span>
                  </div>

                  {/* Ảnh chân dung */}
                  <div className="flex flex-col items-center">
                    <div className="w-full h-40 sm:h-48 bg-gray-100 border border-gray-300 rounded overflow-hidden flex items-center justify-center">
                      <Image
                        alt="Ảnh chân dung"
                        src={getFileUrl(avatarFile?.file__file || "")}
                        width={300}
                      />
                    </div>
                    <span className="mt-2 text-sm text-center">
                      Ảnh chân dung
                    </span>
                  </div>
                </div>
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
  );
}
