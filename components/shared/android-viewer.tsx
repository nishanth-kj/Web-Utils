import React, { useState, useEffect } from 'react';
import { Smartphone, Battery, Wifi, Signal } from 'lucide-react';

interface AndroidXmlViewerProps {
    content: string;
}

export function AndroidXmlViewer({ content }: AndroidXmlViewerProps) {
    const [doc, setDoc] = useState<Document | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(content, 'text/xml');
            
            // Check for parse errors
            const parseError = xmlDoc.getElementsByTagName('parsererror');
            if (parseError.length > 0) {
                setError(parseError[0].textContent || 'Failed to parse XML');
                setDoc(null);
            } else {
                setDoc(xmlDoc);
                setError(null);
            }
        } catch (e: any) {
            setError(e.message);
            setDoc(null);
        }
    }, [content]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-destructive">
                <p className="font-bold mb-2">XML Parse Error</p>
                <pre className="text-xs bg-destructive/10 p-4 rounded-md overflow-auto max-w-full">
                    {error}
                </pre>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-full bg-zinc-950 p-8">
            {/* Device Frame */}
            <div className="relative bg-zinc-900 w-[360px] h-[720px] rounded-[3rem] border-[12px] border-zinc-800 shadow-2xl overflow-hidden flex flex-col shrink-0">
                
                {/* Status Bar */}
                <div className="h-7 w-full flex items-center justify-between px-6 bg-zinc-900 text-zinc-400 text-[10px] font-medium shrink-0 z-50">
                    <div>12:00</div>
                    
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-50"></div>
                    
                    <div className="flex items-center gap-1.5">
                        <Signal className="w-3 h-3" />
                        <Wifi className="w-3 h-3" />
                        <Battery className="w-3.5 h-3.5" />
                    </div>
                </div>

                {/* App Content */}
                <div className="flex-1 bg-white relative overflow-hidden flex flex-col overflow-y-auto">
                    {doc && doc.firstElementChild ? (
                        <AndroidNode node={doc.firstElementChild} />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm">
                            Empty Layout
                        </div>
                    )}
                </div>

                {/* Home Indicator */}
                <div className="h-5 w-full bg-transparent flex items-center justify-center shrink-0 absolute bottom-0 z-50 pointer-events-none">
                    <div className="w-24 h-1 bg-zinc-900/50 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}

// Map attributes to CSS styles
function parseAttributes(node: Element): React.CSSProperties {
    const style: React.CSSProperties = {};
    
    // Width
    const width = node.getAttribute('android:layout_width');
    if (width === 'match_parent' || width === 'fill_parent') style.width = '100%';
    else if (width === 'wrap_content') style.width = 'fit-content';
    else if (width) style.width = width.replace('dp', 'px').replace('sp', 'px');

    // Height
    const height = node.getAttribute('android:layout_height');
    if (height === 'match_parent' || height === 'fill_parent') style.height = '100%';
    else if (height === 'wrap_content') style.height = 'fit-content';
    else if (height) style.height = height.replace('dp', 'px').replace('sp', 'px');

    // Weight (simplified mapping for LinearLayout)
    const weight = node.getAttribute('android:layout_weight');
    if (weight) {
        style.flexGrow = parseFloat(weight);
        style.flexBasis = 0; // standard android behavior for weight
    }

    // Padding
    const padding = node.getAttribute('android:padding');
    if (padding) style.padding = padding.replace('dp', 'px');
    
    // Margins
    const margin = node.getAttribute('android:layout_margin');
    if (margin) style.margin = margin.replace('dp', 'px');
    const marginTop = node.getAttribute('android:layout_marginTop');
    if (marginTop) style.marginTop = marginTop.replace('dp', 'px');
    const marginBottom = node.getAttribute('android:layout_marginBottom');
    if (marginBottom) style.marginBottom = marginBottom.replace('dp', 'px');
    const ms = node.getAttribute('android:layout_marginStart') || node.getAttribute('android:layout_marginLeft');
    if (ms) style.marginLeft = ms.replace('dp', 'px');
    const me = node.getAttribute('android:layout_marginEnd') || node.getAttribute('android:layout_marginRight');
    if (me) style.marginRight = me.replace('dp', 'px');

    // Background
    const bg = node.getAttribute('android:background');
    if (bg) {
        if (bg.startsWith('#')) {
            style.backgroundColor = bg;
        } else if (bg.startsWith('@color/')) {
            // Very rudimentary mock for colors
            if (bg.includes('primary')) style.backgroundColor = '#6200EE';
            else if (bg.includes('accent')) style.backgroundColor = '#03DAC6';
            else if (bg.includes('white')) style.backgroundColor = '#FFFFFF';
            else if (bg.includes('black')) style.backgroundColor = '#000000';
            else style.backgroundColor = '#e0e0e0';
        }
    }

    // Text color
    const textColor = node.getAttribute('android:textColor');
    if (textColor) {
        if (textColor.startsWith('#')) style.color = textColor;
        else if (textColor.includes('white')) style.color = '#FFFFFF';
        else if (textColor.includes('black')) style.color = '#000000';
    }

    // Text Size
    const textSize = node.getAttribute('android:textSize');
    if (textSize) style.fontSize = textSize.replace('sp', 'px').replace('dp', 'px');

    // Gravity (alignment of contents)
    const gravity = node.getAttribute('android:gravity');
    if (gravity) {
        style.display = 'flex';
        
        // Horizontal
        if (gravity.includes('center_horizontal') || gravity === 'center') style.justifyContent = 'center';
        else if (gravity.includes('right') || gravity.includes('end')) style.justifyContent = 'flex-end';
        else style.justifyContent = 'flex-start';

        // Vertical
        if (gravity.includes('center_vertical') || gravity === 'center') style.alignItems = 'center';
        else if (gravity.includes('bottom')) style.alignItems = 'flex-end';
        else style.alignItems = 'flex-start';
    }
    
    // Layout Gravity (alignment of self in parent)
    const layoutGravity = node.getAttribute('android:layout_gravity');
    if (layoutGravity) {
        if (layoutGravity.includes('center')) style.alignSelf = 'center';
        else if (layoutGravity.includes('right') || layoutGravity.includes('end')) style.alignSelf = 'flex-end';
        else if (layoutGravity.includes('bottom')) style.alignSelf = 'flex-end';
    }

    return style;
}

function AndroidNode({ node }: { node: Element }) {
    const tagName = node.tagName;
    const style = parseAttributes(node);
    
    // Common properties
    let text = node.getAttribute('android:text') || '';
    // Handle @string/ mapping roughly
    if (text.startsWith('@string/')) {
        text = text.replace('@string/', '').replace(/_/g, ' ');
    }
    
    const children = Array.from(node.children).map((child, i) => (
        <AndroidNode key={i} node={child} />
    ));

    if (tagName === 'LinearLayout') {
        const orientation = node.getAttribute('android:orientation') || 'horizontal';
        const layoutStyle: React.CSSProperties = {
            ...style,
            display: 'flex',
            flexDirection: orientation === 'vertical' ? 'column' : 'row',
        };
        return <div style={layoutStyle} className="android-linear-layout">{children}</div>;
    }

    if (tagName === 'FrameLayout' || tagName === 'RelativeLayout' || tagName === 'ConstraintLayout') {
        // Simplified mapping for stack/relative layouts
        const layoutStyle: React.CSSProperties = {
            ...style,
            position: 'relative',
            display: 'flex',
            // Default FrameLayout stacks children top-left
        };
        
        // Fix for FrameLayout children needing absolute positioning if we really want to stack them,
        // but flex is safer for a quick mock. We'll use a grid to stack them easily.
        if (tagName === 'FrameLayout') {
            layoutStyle.display = 'grid';
            layoutStyle.gridTemplateColumns = '1fr';
            layoutStyle.gridTemplateRows = '1fr';
        }

        return <div style={layoutStyle} className={`android-layout ${tagName}`}>
            {Array.from(node.children).map((child, i) => (
                <div key={i} style={tagName === 'FrameLayout' ? { gridColumn: 1, gridRow: 1 } : {}}>
                    <AndroidNode node={child} />
                </div>
            ))}
        </div>;
    }

    if (tagName === 'TextView') {
        const textStyle = {
            ...style,
            fontFamily: 'sans-serif',
            color: style.color || '#333',
        };
        return <span style={textStyle} className="android-textview">{text}</span>;
    }

    if (tagName === 'Button') {
        return (
            <button style={{
                padding: '8px 16px',
                backgroundColor: style.backgroundColor || '#6200EE',
                color: style.color || 'white',
                borderRadius: '4px',
                border: 'none',
                fontWeight: 500,
                textTransform: 'uppercase',
                fontFamily: 'sans-serif',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                ...style
            }} className="android-button">
                {text}
            </button>
        );
    }

    if (tagName === 'ImageView') {
        return (
            <div style={{ 
                ...style, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                backgroundColor: style.backgroundColor || '#e0e0e0',
                minWidth: style.width ? undefined : '48px',
                minHeight: style.height ? undefined : '48px'
            }} className="android-imageview">
                <span className="text-[10px] text-gray-500">IMG</span>
            </div>
        );
    }
    
    // Fallback for unknown views
    return (
        <div style={style} className={`android-unknown ${tagName}`}>
            {children}
        </div>
    );
}
