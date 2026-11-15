"use client";

import { useMemo, useState } from "react";
import { Download, Copy, Check, QrCode, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateQrMatrix, qrMatrixToSvg } from "@/lib/qr-code";

type ContentType = "text" | "email" | "phone" | "wifi";

function escapeWifi(value: string): string {
    return value.replace(/([\\;,:"])/g, "\\$1");
}

export function QrCodePage() {
    const [contentType, setContentType] = useState<ContentType>("text");
    const [value, setValue] = useState("https://webutils.site");
    const [emailSubject, setEmailSubject] = useState("");
    const [phone, setPhone] = useState("");
    const [wifiName, setWifiName] = useState("");
    const [wifiPassword, setWifiPassword] = useState("");
    const [wifiSecurity, setWifiSecurity] = useState("WPA");
    const [hiddenNetwork, setHiddenNetwork] = useState(false);
    const [foreground, setForeground] = useState("#000000");
    const [background, setBackground] = useState("#ffffff");
    const [size, setSize] = useState(512);
    const [copied, setCopied] = useState(false);

    const payload = useMemo(() => {
        if (contentType === "email") return `mailto:${value.trim()}?subject=${encodeURIComponent(emailSubject)}`;
        if (contentType === "phone") return `tel:${phone.trim()}`;
        if (contentType === "wifi") {
            return `WIFI:T:${wifiSecurity};S:${escapeWifi(wifiName)};P:${escapeWifi(wifiPassword)};H:${hiddenNetwork ? "true" : "false"};;`;
        }
        return value.trim();
    }, [contentType, value, emailSubject, phone, wifiName, wifiPassword, wifiSecurity, hiddenNetwork]);

    const result = useMemo(() => {
        try {
            if ((contentType === "text" || contentType === "email") && !value.trim()) return { matrix: null, error: "Enter a value to generate a QR code." };
            if (contentType === "phone" && !phone.trim()) return { matrix: null, error: "Enter a phone number." };
            if (contentType === "wifi" && !wifiName.trim()) return { matrix: null, error: "Enter your Wi-Fi network name." };
            return { matrix: generateQrMatrix(payload), error: null };
        } catch (error) {
            return { matrix: null, error: error instanceof Error ? error.message : "Unable to generate this QR code." };
        }
    }, [contentType, value, phone, wifiName, payload]);

    const svg = useMemo(() => result.matrix ? qrMatrixToSvg(result.matrix, foreground, background) : "", [result.matrix, foreground, background]);

    const download = async (format: "svg" | "png") => {
        if (!svg) return;
        let blob: Blob;
        if (format === "svg") {
            blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        } else {
            const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
            try {
                const image = new Image();
                image.src = url;
                await new Promise<void>((resolve, reject) => {
                    image.onload = () => resolve();
                    image.onerror = () => reject(new Error("Could not render the QR code."));
                });
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                const context = canvas.getContext("2d");
                if (!context) throw new Error("Canvas is not available in this browser.");
                context.imageSmoothingEnabled = false;
                context.fillStyle = background;
                context.fillRect(0, 0, size, size);
                context.drawImage(image, 0, 0, size, size);
                blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((file) => file ? resolve(file) : reject(new Error("PNG export failed.")), "image/png"));
            } finally {
                URL.revokeObjectURL(url);
            }
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `web-utils-qr.${format}`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const copyPayload = async () => {
        await navigator.clipboard.writeText(payload);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };

    return (
        <div className="h-full overflow-auto bg-background custom-scrollbar w-full">
            <div className="mx-auto w-full max-w-5xl space-y-7 p-5 sm:p-8">
                <header className="flex flex-col gap-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground">
                            <QrCode className="size-8 text-primary" /> QR Code Generator
                        </h1>
                        <p className="text-sm text-muted-foreground">Create customizable QR codes for links, text, contact details and Wi-Fi access.</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border px-3 py-2 text-xs text-muted-foreground">
                        <ShieldCheck className="size-4 text-emerald-500" /> Generated locally in your browser
                    </div>
                </header>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <Card>
                        <CardHeader><CardTitle className="text-sm">QR content</CardTitle></CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex flex-wrap gap-2">
                                {(["text", "email", "phone", "wifi"] as ContentType[]).map((type) => (
                                    <Button key={type} type="button" size="sm" variant={contentType === type ? "default" : "outline"} onClick={() => setContentType(type)}>
                                        {type === "text" ? "Text / URL" : type === "wifi" ? "Wi-Fi" : type[0].toUpperCase() + type.slice(1)}
                                    </Button>
                                ))}
                            </div>

                            {(contentType === "text" || contentType === "email") && (
                                <div className="space-y-2">
                                    <label htmlFor="qr-value" className="text-sm font-medium">{contentType === "email" ? "Email address" : "Text or URL"}</label>
                                    <Input id="qr-value" value={value} onChange={(event) => setValue(event.target.value)} placeholder={contentType === "email" ? "name@example.com" : "https://example.com"} />
                                </div>
                            )}
                            {contentType === "email" && (
                                <div className="space-y-2">
                                    <label htmlFor="qr-subject" className="text-sm font-medium">Email subject (optional)</label>
                                    <Input id="qr-subject" value={emailSubject} onChange={(event) => setEmailSubject(event.target.value)} placeholder="Hello" />
                                </div>
                            )}
                            {contentType === "phone" && (
                                <div className="space-y-2">
                                    <label htmlFor="qr-phone" className="text-sm font-medium">Phone number</label>
                                    <Input id="qr-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" />
                                </div>
                            )}
                            {contentType === "wifi" && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2 sm:col-span-2">
                                        <label htmlFor="qr-wifi-name" className="text-sm font-medium">Network name (SSID)</label>
                                        <Input id="qr-wifi-name" value={wifiName} onChange={(event) => setWifiName(event.target.value)} placeholder="My Wi-Fi" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="qr-wifi-password" className="text-sm font-medium">Password</label>
                                        <Input id="qr-wifi-password" type="password" value={wifiPassword} onChange={(event) => setWifiPassword(event.target.value)} placeholder="Wi-Fi password" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="qr-wifi-security" className="text-sm font-medium">Security</label>
                                        <select id="qr-wifi-security" value={wifiSecurity} onChange={(event) => setWifiSecurity(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                                            <option value="WPA">WPA / WPA2 / WPA3</option>
                                            <option value="WEP">WEP</option>
                                            <option value="nopass">No password</option>
                                        </select>
                                    </div>
                                    <label className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
                                        <input type="checkbox" checked={hiddenNetwork} onChange={(event) => setHiddenNetwork(event.target.checked)} /> Hidden network
                                    </label>
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="qr-foreground" className="text-sm font-medium">QR color</label>
                                    <div className="flex h-10 items-center gap-3 rounded-md border px-3">
                                        <input id="qr-foreground" type="color" value={foreground} onChange={(event) => setForeground(event.target.value)} className="size-6 cursor-pointer border-0 bg-transparent p-0" />
                                        <span className="font-mono text-xs text-muted-foreground">{foreground}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="qr-background" className="text-sm font-medium">Background color</label>
                                    <div className="flex h-10 items-center gap-3 rounded-md border px-3">
                                        <input id="qr-background" type="color" value={background} onChange={(event) => setBackground(event.target.value)} className="size-6 cursor-pointer border-0 bg-transparent p-0" />
                                        <span className="font-mono text-xs text-muted-foreground">{background}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="qr-size" className="text-sm font-medium">PNG output size</label>
                                <select id="qr-size" value={size} onChange={(event) => setSize(Number(event.target.value))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                                    {[256, 384, 512, 768, 1024].map((option) => <option key={option} value={option}>{option} × {option}px</option>)}
                                </select>
                            </div>
                            {result.error && <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"><AlertCircle className="mt-0.5 size-4 shrink-0" />{result.error}</div>}
                        </CardContent>
                    </Card>

                    <Card className="h-fit">
                        <CardHeader><CardTitle className="text-sm">Live preview</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex aspect-square items-center justify-center rounded-xl border bg-muted/20 p-5">
                                {result.matrix ? (
                                    <div className="w-full max-w-[260px] rounded bg-white p-2">
                                        <svg viewBox={`0 0 ${result.matrix.length + 8} ${result.matrix.length + 8}`} className="block h-auto w-full" role="img" aria-label="Generated QR code" shapeRendering="crispEdges">
                                            <rect width="100%" height="100%" fill={background} />
                                            {result.matrix.map((row, y) => row.map((dark, x) => dark ? <rect key={`${x}-${y}`} x={x + 4} y={y + 4} width="1" height="1" fill={foreground} /> : null))}
                                        </svg>
                                    </div>
                                ) : <p className="px-4 text-center text-sm text-muted-foreground">Enter content to preview your QR code.</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button type="button" onClick={() => download("png")} disabled={!result.matrix}><Download className="mr-2 size-4" /> PNG</Button>
                                <Button type="button" variant="outline" onClick={() => download("svg")} disabled={!result.matrix}><Download className="mr-2 size-4" /> SVG</Button>
                            </div>
                            <Button type="button" variant="ghost" className="w-full" onClick={copyPayload} disabled={!result.matrix}>
                                {copied ? <Check className="mr-2 size-4 text-emerald-500" /> : <Copy className="mr-2 size-4" />}
                                {copied ? "Content copied" : "Copy QR content"}
                            </Button>
                            <p className="text-center text-xs text-muted-foreground">Error correction: Low (7%). Keep strong contrast for reliable scanning.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
