// src/components/DesignEditor/components/Canvas/Canvas.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { useTranslation } from 'react-i18next';
import { ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';
import { useDesignEditor } from '../../context/DesignEditorContext';
import { useCanvasEvents } from '../../hooks/useCanvasEvents';
import styles from './Canvas.module.scss';
import '../../styles/guidelines.scss'; // Import guidelines styles
import GuidelinesHandler from '../../utils/GuideLines';

/**
 * Canvas 컴포넌트
 * fabric.js 캔버스를 관리하고 상호작용을 처리합니다.
 */
const Canvas: React.FC = () => {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const guidelinesRef = useRef<GuidelinesHandler | null>(null);
    const gridGroupRef = useRef<fabric.Group | null>(null);

    // Design Editor 컨텍스트 사용
    const {
        setCanvas,
        canvas,
        canvasWidth,
        canvasHeight,
        zoomLevel,
        setZoomLevel,
        showGrid,
        snapToGuides,
        snapToGrid,
        toggleSnapToGuides,
        toggleSnapToGrid
    } = useDesignEditor();

    // 패닝 상태 관리
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
    const [isCanvasReady, setIsCanvasReady] = useState(false);

    // 그리드 생성 함수
    const createGrid = useCallback(() => {
        if (!canvas) return;

        // Remove existing grid if any
        if (gridGroupRef.current) {
            canvas.remove(gridGroupRef.current);
            gridGroupRef.current = null;
        }

        if (showGrid) {
            // Create grid
            const gridSize = 20;
            const gridLines: fabric.Line[] = [];

            // Create vertical lines
            for (let i = 0; i <= canvasWidth; i += gridSize) {
                const isMajor = i % (gridSize * 5) === 0;
                gridLines.push(new fabric.Line([i, 0, i, canvasHeight], {
                    stroke: isMajor ? '#aaa' : '#ddd',
                    strokeWidth: isMajor ? 0.7 : 0.5,
                    selectable: false,
                    evented: false,
                    excludeFromExport: true
                }));
            }

            // Create horizontal lines
            for (let i = 0; i <= canvasHeight; i += gridSize) {
                const isMajor = i % (gridSize * 5) === 0;
                gridLines.push(new fabric.Line([0, i, canvasWidth, i], {
                    stroke: isMajor ? '#aaa' : '#ddd',
                    strokeWidth: isMajor ? 0.7 : 0.5,
                    selectable: false,
                    evented: false,
                    excludeFromExport: true
                }));
            }

            // Create a group for all grid lines
            const gridGroup = new fabric.Group(gridLines, {
                selectable: false,
                evented: false,
                excludeFromExport: true
            });

            // Add grid to canvas and store reference
            canvas.add(gridGroup);
            gridGroup.sendToBack();
            gridGroupRef.current = gridGroup;
        }

        canvas.requestRenderAll();
    }, [canvas, showGrid, canvasWidth, canvasHeight]);

    // 컴포넌트 마운트 시 canvas 초기화
    useEffect(() => {
        if (!canvasRef.current || canvas) {return;}

        // fabric.js 캔버스 생성
        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true,
            selection: true,
            stopContextMenu: true,
            renderOnAddRemove: true
        });

        // 캔버스 Context에 설정
        setCanvas(fabricCanvas);
        setIsCanvasReady(true);

        // 컴포넌트 언마운트 시 정리
        return () => {
            // Clean up guidelines handler
            if (guidelinesRef.current) {
                guidelinesRef.current.destroy();
            }
            fabricCanvas.dispose();
        };
    }, [canvasRef, setCanvas, canvasWidth, canvasHeight]);

    // Initialize guidelines handler
    useEffect(() => {
        if (!canvas || !isCanvasReady) return;

        // Create guidelines handler
        guidelinesRef.current = new GuidelinesHandler(canvas, canvasWidth, canvasHeight, {
            enabled: snapToGuides,
            snapToGrid: snapToGrid,
            showGuides: snapToGuides,
            gridSize: 20 // Match the grid size used in createGrid
        });

        // Create initial grid
        createGrid();

        return () => {
            if (guidelinesRef.current) {
                guidelinesRef.current.destroy();
                guidelinesRef.current = null;
            }
        };
    }, [canvas, isCanvasReady, canvasWidth, canvasHeight, createGrid]);

    // Update guidelines configuration when settings change
    useEffect(() => {
        if (!guidelinesRef.current) return;

        guidelinesRef.current.updateConfig({
            enabled: snapToGuides,
            snapToGrid: snapToGrid,
            showGuides: snapToGuides
        });
    }, [snapToGuides, snapToGrid]);

    // Update grid when showGrid changes
    useEffect(() => {
        createGrid();
    }, [showGrid, createGrid]);

    // 캔버스 렌더링 문제 해결을 위한 추가 효과
    useEffect(() => {
        if (!canvas || !isCanvasReady) {return;}

        // 캔버스 초기화 후 렌더링 강제화
        const forceInitialRender = () => {
            setTimeout(() => {
                canvas.requestRenderAll();
            }, 300);
        };

        forceInitialRender();

        // 객체 선택 시 추가 렌더링
        const handleSelection = () => {
            canvas.requestRenderAll();
        };

        // 객체 추가/수정 시 추가 렌더링
        const handleObjectChange = () => {
            canvas.requestRenderAll();
        };

        // 이벤트 리스너 등록
        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);
        canvas.on('selection:cleared', handleSelection);
        canvas.on('object:added', handleObjectChange);
        canvas.on('object:modified', handleObjectChange);
        canvas.on('object:removed', handleObjectChange);

        // 정리 함수
        return () => {
            canvas.off('selection:created', handleSelection);
            canvas.off('selection:updated', handleSelection);
            canvas.off('selection:cleared', handleSelection);
            canvas.off('object:added', handleObjectChange);
            canvas.off('object:modified', handleObjectChange);
            canvas.off('object:removed', handleObjectChange);
        };
    }, [canvas, isCanvasReady]);

    // 줌 레벨 변경 적용
    useEffect(() => {
        if (!canvas) {return;}

        canvas.setZoom(zoomLevel);

        // 캔버스 중앙 정렬
        const vpt = canvas.viewportTransform;
        if (vpt) {
            vpt[4] = (canvasWidth * (1 - zoomLevel)) / 2;
            vpt[5] = (canvasHeight * (1 - zoomLevel)) / 2;
        }
        canvas.requestRenderAll();
    }, [canvas, zoomLevel, canvasWidth, canvasHeight]);

    // 캔버스 이벤트 설정
    const { handleKeyDown, setupObjectMovingEvents } = useCanvasEvents();

    // Set up object moving events for snap-to-grid
    useEffect(() => {
        if (!canvas || !isCanvasReady) return;

        const cleanup = setupObjectMovingEvents();
        return cleanup;
    }, [canvas, isCanvasReady, setupObjectMovingEvents]);

    // 키보드 단축키 처리
    useEffect(() => {
        if (!canvas) {return;}

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [canvas, handleKeyDown]);

    // 마우스 휠로 줌 처리
    useEffect(() => {
        if (!canvas || !containerRef.current) {return;}

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                e.stopPropagation();

                const delta = e.deltaY;
                const zoom = canvas.getZoom();
                const newZoom = delta > 0 ? Math.max(zoom - 0.05, 0.1) : Math.min(zoom + 0.05, 3);

                // 커서 위치 기준 줌
                const container = containerRef.current;
                if (!container) {return;}

                const rect = container.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                zoomToPoint(newZoom, { x: mouseX, y: mouseY });
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [canvas, containerRef]);

    // 마우스 중간 버튼 또는 스페이스+드래그로 패닝
    useEffect(() => {
        if (!canvas || !containerRef.current) {return;}

        let isSpacePressed = false;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                isSpacePressed = true;
                document.body.style.cursor = 'grab';
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                isSpacePressed = false;
                document.body.style.cursor = 'default';
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
                setIsPanning(true);
                setLastPanPoint({ x: e.clientX, y: e.clientY });
                document.body.style.cursor = 'grabbing';
                e.preventDefault();
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isPanning && canvas) {
                e.preventDefault();
                const vpt = canvas.viewportTransform;
                if (!vpt) {return;}

                vpt[4] += e.clientX - lastPanPoint.x;
                vpt[5] += e.clientY - lastPanPoint.y;

                canvas.requestRenderAll();
                setLastPanPoint({ x: e.clientX, y: e.clientY });
            }
        };

        const handleMouseUp = () => {
            if (isPanning) {
                setIsPanning(false);
                document.body.style.cursor = isSpacePressed ? 'grab' : 'default';
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
        }

        return () => {
            if (container) {
                container.removeEventListener('mousedown', handleMouseDown);
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                window.removeEventListener('keydown', handleKeyDown);
                window.removeEventListener('keyup', handleKeyUp);
            }
        };
    }, [canvas, isPanning, lastPanPoint]);

    // 특정 지점에 줌
    const zoomToPoint = (zoom: number, point: { x: number, y: number }) => {
        if (!canvas) {return;}

        const vpt = canvas.viewportTransform;
        if (!vpt) {return;}

        canvas.zoomToPoint({ x: point.x, y: point.y }, zoom);

        // 컨텍스트의 줌 레벨 업데이트
        setZoomLevel(zoom);
    };

    // 줌 컨트롤 함수
    const zoomIn = () => {
        setZoomLevel(Math.min(zoomLevel + 0.1, 3));
    };

    const zoomOut = () => {
        setZoomLevel(Math.max(zoomLevel - 0.1, 0.1));
    };

    const zoomToFit = () => {
        if (!canvas || !containerRef.current) {return;}

        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // 캔버스를 컨테이너에 맞추기 위한 줌 레벨 계산
        const scaleX = containerWidth / canvasWidth;
        const scaleY = containerHeight / canvasHeight;
        // 여백을 위해 90% 크기로 조정
        const scale = Math.min(scaleX, scaleY) * 0.9;

        setZoomLevel(scale);
    };

    const resetZoom = () => {
        setZoomLevel(1);
    };

    return (
        <div
            ref={containerRef}
            className={`${styles.canvasContainer} ${isPanning ? styles.panning : ''}`}
        >
            <div
                className={styles.canvasWrapper }
                style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center center'
                }}
            >
                <canvas ref={canvasRef} />
            </div>

            {/* 빈 상태일 때 표시되는 메시지 */}
            {canvas && canvas.getObjects().length === 0 && (
                <div className={styles.placeholder}>
                    {t('editor.canvasPlaceholder', 'Add objects to start designing')}
                </div>
            )}

            {/* 스냅 모드 표시기 */}
            {(snapToGrid || snapToGuides) && (
                <div className={styles.snapIndicator}>
                    {snapToGrid && (
                        <div className={styles.snapBadge} title={t('editor.snapToGridEnabled')}>
                            Grid Snap
                        </div>
                    )}
                    {snapToGuides && (
                        <div className={styles.snapBadge} title={t('editor.snapToGuidesEnabled')}>
                            Guide Snap
                        </div>
                    )}
                </div>
            )}

            {/* 줌 컨트롤 */}
            <div className={styles.zoomControls}>
                <button
                    onClick={zoomOut}
                    title={t('editor.zoomOut')}
                    className={zoomLevel <= 0.1 ? styles.disabled : ''}
                    disabled={zoomLevel <= 0.1}
                >
                    <ZoomOut size={16} />
                </button>

                <span className={styles.zoomLevel}>{Math.round(zoomLevel * 100)}%</span>

                <button
                    onClick={zoomIn}
                    title={t('editor.zoomIn')}
                    className={zoomLevel >= 3 ? styles.disabled : ''}
                    disabled={zoomLevel >= 3}
                >
                    <ZoomIn size={16} />
                </button>

                <button
                    onClick={zoomToFit}
                    title={t('editor.zoomToFit')}
                >
                    <Minimize size={16} />
                </button>

                <button
                    onClick={resetZoom}
                    title={t('editor.resetZoom')}
                    className={zoomLevel === 1 ? styles.active : ''}
                >
                    <Maximize size={16} />
                </button>
            </div>
        </div>
    );
};

export default Canvas;