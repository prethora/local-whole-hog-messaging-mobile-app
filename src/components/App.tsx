import { SplashScreen } from '@capacitor/splash-screen';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BarcodeScanner, CheckPermissionResult, ScanResult } from '@prethora/barcode-scanner';
import { Filesystem, Directory, Encoding, ReadFileResult } from '@capacitor/filesystem';
import logoSrc from "../assets/logo.png";
import { s } from '../lib/styler';
import QRScannerOverlay from "./App/QRScannerOverlay";

const META_FILE = 'meta.json';

async function blobToText(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.onerror = () => {
            reject(reader.error);
        };
        reader.readAsText(blob);
    });
}

export const getSignedInUrl = async (): Promise<string> => {
    try {
        const file: ReadFileResult = await Filesystem.readFile({
            path: META_FILE,
            directory: Directory.Data,
            encoding: Encoding.UTF8,
        });

        const raw = typeof file.data === 'string'
            ? file.data
            : await blobToText(file.data);

        const json = JSON.parse(raw) as { signinUrl?: string };
        return json.signinUrl ?? '';
    } catch (e) {
        return "";
    }
};

export const setSignedInUrl = async (url: string): Promise<void> => {
    const data = { signinUrl: url };
    await Filesystem.writeFile({
        path: META_FILE,
        directory: Directory.Data,
        data: JSON.stringify(data),
        encoding: Encoding.UTF8,
    });
};

const ensurePermission = async () => {
    const status: CheckPermissionResult = await BarcodeScanner.checkPermission({ force: true });
    if (!status.granted) {
        console.warn('Camera permission not granted');
        return false;
    }
    return true;
};

export default function App() {
    const [isScanning, setIsScanner] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastText, setToastText] = useState("");
    const toastTimeoutRef = useRef(0);

    useEffect(() => {
        (async () => {
            // await db.reset();
            const params = new URLSearchParams(window.location.search);
            const isSignout = params.get("signout") === "true";
            if (isSignout) {
                await setSignedInUrl("");
            }
            else {
                const redirectUrl = await getSignedInUrl();
                if (redirectUrl !== "") {
                    document.location = redirectUrl;
                    return;
                }
            }
            setTimeout(() => {
                SplashScreen.hide();
            }, 200);
        })();
    }, []);

    const clearToastTimeout = useCallback(() => {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = 0;
    }, []);

    const showInvalidQrCodeToast = useCallback((message: "Invalid" | "None" | "Noop" = "Invalid") => {
        const messages = {
            "Invalid": "Invalid QR code detected",
            "None": "No QR code found",
            "Noop": "Camera permissions required",
        };
        clearToastTimeout();
        setToastText(messages[message]);
        setShowToast(true);
        toastTimeoutRef.current = setTimeout(() => {
            setShowToast(false);
        }, 7000);
    }, []);

    const handleScanQrCodeClick = useCallback(async () => {
        clearToastTimeout();
        setShowToast(false);

        const hasPerm = await ensurePermission();
        if (!hasPerm) {
            showInvalidQrCodeToast("Noop");
            return;
        }
        BarcodeScanner.hideBackground(); // Make webview transparent for camera
        setIsScanner(true);

        try {
            const result: ScanResult = await BarcodeScanner.startScan(); // Blocks until scan is complete, cancelled, or errors

            if (!result.hasContent) {
                console.error('No QR code content found.');
                showInvalidQrCodeToast("None");
                BarcodeScanner.showBackground();
                setIsScanner(false);
                return;
            }

            let parsedData;
            try {
                parsedData = JSON.parse(result.content);
            } catch (e) {
                console.error('Failed to parse QR code JSON:', e);
                showInvalidQrCodeToast();
                BarcodeScanner.showBackground();
                setIsScanner(false);
                return;
            }

            const { userId, username, securityKey, apiBaseUrl } = parsedData;

            if (typeof userId !== 'number' || userId <= 0) {
                console.error('Invalid QR code data: userId must be a number greater than 0.');
                showInvalidQrCodeToast();
                BarcodeScanner.showBackground();
                setIsScanner(false);
                return;
            }
            if (typeof username !== 'string' || username.trim() === '') {
                console.error('Invalid QR code data: username must be a non-empty string.');
                showInvalidQrCodeToast();
                BarcodeScanner.showBackground();
                setIsScanner(false);
                return;
            }
            if (typeof securityKey !== 'string' || securityKey.length !== 64 || !/^[0-9a-f]{64}$/.test(securityKey)) {
                console.error('Invalid QR code data: securityKey must be a 64-character lowercase hexadecimal string.');
                showInvalidQrCodeToast();
                BarcodeScanner.showBackground();
                setIsScanner(false);
                return;
            }
            if (typeof apiBaseUrl !== 'string') {
                console.error('Invalid QR code data: apiBaseUrl must be a string.');
                showInvalidQrCodeToast();
                BarcodeScanner.showBackground();
                setIsScanner(false);
                return;
            }
            try {
                new URL(apiBaseUrl); // Validate URL format
            } catch (e) {
                console.error('Invalid QR code data: apiBaseUrl must be a valid URL.');
                showInvalidQrCodeToast();
                BarcodeScanner.showBackground();
                setIsScanner(false);
                return;
            }

            // All validations passed, proceed with redirect
            BarcodeScanner.showBackground(); // Restore webview opacity before navigation

            const redirectUrl = `/whm_app/index.html?userId=${encodeURIComponent(String(userId))}&username=${encodeURIComponent(username)}&securityKey=${encodeURIComponent(securityKey)}&apiBaseUrl=${encodeURIComponent(apiBaseUrl)}`;
            await setSignedInUrl(redirectUrl);
            document.location.href = redirectUrl;
        } catch (err: any) {
            // This catch handles errors from BarcodeScanner.startScan() itself,
            // including when the scan is cancelled (e.g., by BarcodeScanner.stopScan()).
            console.error('Scan operation failed or was cancelled:', err);
            BarcodeScanner.showBackground(); // Ensure webview is opaque
            setIsScanner(false);             // Ensure scanning UI is hidden
        }
    }, []);

    const handlerBackClick = useCallback(() => {
        console.log("Scan cancelled by user.");
        BarcodeScanner.stopScan(); // This will cause the startScan() promise to reject, caught above.
        // UI reset (showBackground, setIsScanner) will be handled by the catch block in handleScanQrCodeClick
        // or here if preferred, but doing it in the catch block centralizes error/cancellation cleanup from startScan.
        // For clarity and to ensure it happens if stopScan itself has issues or if the catch logic changes:
        BarcodeScanner.showBackground();
        setIsScanner(false);
    }, []);

    return (
        <>
            <div className={s("fixed left-0 top-0 h-full w-full flex flex-col justify-center items-center bg-[#f6e07c]", {}, [
                ["hidden", "", isScanning]
            ])}>
                <img className='w-[78%]' src={logoSrc} />
                <div className='text-center text-[13px] px-[30px] pt-[22px] pb-[26px] text-gray-700'>
                    Please log in to your WHOLE HOG account and navigate to Messages &gt; Settings to view your QR
                    Code for signing in.
                </div>
                <div
                    className="bg-gray-200 text-gray-700 py-[10px] px-[22px] rounded-[30px] active:bg-gray-200/75 text-[12px] shadow-sm"
                    onClick={handleScanQrCodeClick}
                >Launch QR Scanner</div>
                <div className={s("absolute left-0 bottom-[40px] right-0 flex justify-center transition-opacity duration-200", {}, [
                    ["opacity-100", "opacity-0", showToast]
                ])}>
                    <div className='bg-gray-700 text-white px-[30px] py-[10px] rounded-full'>
                        {toastText}
                    </div>
                </div>
            </div>
            {isScanning && <QRScannerOverlay onBackClick={handlerBackClick} />}
        </>
    );
}