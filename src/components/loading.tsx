import { Card, CardBody } from "@nextui-org/card";
import { Modal, ModalContent } from "@nextui-org/modal";
import { Spinner } from "@nextui-org/spinner";

export const ElevatedLoading = () => (
  <Modal
    backdrop="opaque"
    defaultOpen={true}
    hideCloseButton={true}
    isDismissable={false}
    placement="center"
  >
    <ModalContent className="flex max-w-[12em] justify-center p-5 align-middle">
      <Spinner classNames={{ wrapper: "pt-2" }} />
      <h3 className="mt-3 text-center font-semibold">Loading ...</h3>
    </ModalContent>
  </Modal>
);

export const ComponentLoading = ({ message }: { message?: string }) => (
  <Card className="">
    <CardBody className="mx-auto">
      <Spinner classNames={{ wrapper: "pt-2" }} />
      <h3 className="mt-3 text-center font-semibold">
        {message ? message : "Loading ..."}
      </h3>
    </CardBody>
  </Card>
);
