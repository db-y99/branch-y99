"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
} from "@heroui/react";

import { Application } from "@/types";
import { updateApplicationNote } from "@/actions/applications";

interface NotesModalProps {
  application: Application | null;
  loginId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NotesModal({
  application,
  loginId,
  isOpen,
  onClose,
  onSuccess,
}: NotesModalProps) {
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (application) {
      setNote(application.note || "");
      setError(null);
    }
  }, [application, isOpen]);

  const handleSave = async () => {
    if (!application) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateApplicationNote({
        id: application.id,
        note: note,
        code: application.code,
        fullname: application.fullname,
        province: application.province,
        district: application.district,
        address: application.address,
        legal_code: application.legal_code,
        country: application.country,
        sex: application.sex,
        legal_type: application.legal_type,
        loginId: loginId,
      });

      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(result.error || "Failed to update note");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} size={"2xl"} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Ghi chú</ModalHeader>
            <ModalBody>
              <Textarea
                className="w-full"
                isDisabled={isLoading}
                label="Ghi chú"
                rows={10}
                value={note}
                onValueChange={setNote}
              />
              {error && <div className="text-danger text-sm mt-2">{error}</div>}
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                isDisabled={isLoading}
                variant="light"
                onPress={onClose}
              >
                Đóng
              </Button>
              <Button
                color="primary"
                isLoading={isLoading}
                onPress={handleSave}
              >
                Lưu
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
