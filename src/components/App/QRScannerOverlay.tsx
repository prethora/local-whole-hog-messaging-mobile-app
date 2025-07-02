import { useCallback } from "react";
import Icon from "../commons/Icon";
import { setSignedInUrl } from "../App";

export type QRScannerOverlayProps = {
    onBackClick?: () => void;
}

export default function QRScannerOverlay({ onBackClick }: QRScannerOverlayProps) {
    const handleSimulateQrCodeClick = useCallback(async () => {
        const redirectQuery = process.env.REACT_APP_SIMULATE_QR_CODE_QUERY || "";
        if (redirectQuery) {
            const redirectUrl = `/whm_app/index.html?${redirectQuery}`;
            await setSignedInUrl(redirectUrl);
            document.location.href = redirectUrl;
        }
    }, []);

    return (
        <div className="fixed left-0 top-0 h-full w-full flex flex-col justify-between">
            <div className="basis-[100px] bg-white flex flex-col justify-end">
                <div className="flex items-center pb-[20px] gap-[16px] pl-[20px] text-gray-600">
                    <Icon activeExpandX={6} activeExpandY={3} className="relative top-[3px]" name="bx-left-arrow-alt" size="30px" onClick={onBackClick} />
                    <div className="font-bold text-[18px]">Scan QR Code</div>
                </div>
            </div>
            <div className="basis-[100px] bg-white text-center pt-[20px]" onClick={handleSimulateQrCodeClick}>
                Scan a QR code to log in.
            </div>
        </div>
    );
}