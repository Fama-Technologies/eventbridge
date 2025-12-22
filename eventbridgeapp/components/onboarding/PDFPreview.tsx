'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText } from 'lucide-react';

interface PDFPreviewProps {
    file: File;
    className?: string;
}

export default function PDFPreview({ file, className = '' }: PDFPreviewProps) {
    const [error, setError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let isMounted = true;

        const loadPDF = async () => {
            try {
                // Dynamically import pdfjs-dist only on client side
                const pdfjsLib = await import('pdfjs-dist');

                // Set worker path
                pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

                // Load PDF
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const page = await pdf.getPage(1);

                // Render to canvas
                const viewport = page.getViewport({ scale: 0.5 });
                const canvas = canvasRef.current;

                if (canvas && isMounted) {
                    const context = canvas.getContext('2d');
                    canvas.height = 64;
                    canvas.width = 64;

                    if (context) {
                        await page.render({
                            canvasContext: context,
                            canvas: canvas,
                            viewport: page.getViewport({ scale: 64 / viewport.width })
                        }).promise;

                        setPreviewUrl(canvas.toDataURL());
                        setLoading(false);
                    }
                }
            } catch (err) {
                console.error('Failed to load PDF:', err);
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        loadPDF();

        return () => {
            isMounted = false;
        };
    }, [file]);

    if (loading || error) {
        return (
            <div className={`flex items-center justify-center bg-neutrals-03 ${className}`}>
                <FileText className={`w-6 h-6 text-neutrals-07 ${loading ? 'animate-pulse' : ''}`} />
            </div>
        );
    }

    return (
        <>
            <canvas ref={canvasRef} className="hidden" />
            {previewUrl && (
                <img
                    src={previewUrl}
                    alt="PDF preview"
                    className="w-full h-full object-cover"
                />
            )}
        </>
    );
}
