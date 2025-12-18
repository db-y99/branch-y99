import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
} from "@heroui/react";

interface NotesModalProps {
  note: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotesModal({ note, isOpen, onClose }: NotesModalProps) {
  console.log(note);

  return (
    <Modal isOpen={isOpen} size={"2xl"} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Ghi chú</ModalHeader>
            <ModalBody>
              <Textarea
                label="Ghi chú"
                value={note}
                rows={10}
                className="w-full"
              ></Textarea>
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
