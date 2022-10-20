import { PopUpModal } from "../Modal/popupModal";
import loader from "../../assets/animations/loader.json";
import Lottie from "lottie-react";

interface IConfirmTransactionProps {
  show: boolean;
  content: string;
  setShow: any;
}
function ConfirmTransaction(props: IConfirmTransactionProps) {
  const closeModal = () => {
    props.setShow(false);
  };

  return props.show ? (
    <PopUpModal title="Confirm transaction" onhide={closeModal}>
      {
        <>
          <div className="flex justify-center mt-10">
            <Lottie
              animationData={loader}
              loop={true}
              style={{ height: "150px", width: "150px" }}
            />
          </div>
          <div className="mt-11 border border-border-100/[0.4] rounded-2xl bg-secondary-100/[0.02] flex justify-center items-center h-[52px] font-subtitle4">
            {props.content}
          </div>
          <div className="my-3 font-caption1 flex justify-center text-text-300">
            Confirm the transaction in your wallet
          </div>
        </>
      }
    </PopUpModal>
  ) : null;
}

export default ConfirmTransaction;