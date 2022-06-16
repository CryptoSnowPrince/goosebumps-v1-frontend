import React, { useEffect, useRef } from 'react';
import { UDFCompatibleDatafeed } from './tradingview/udf-compatible-datafeed';

const Chart = (props) => {
    console.log("unpass")
    const chartViewerRef = useRef();
    const containerRef = useRef();

    let initY = 0;
    let initHeight = 0;
    const resizeStart = (e) => {
        document.addEventListener("touchEnd", resizeStop);
        document.addEventListener("mouseup", resizeStop);
        document.addEventListener("mousemove", onResize);
        document.addEventListener("touchmove", onResize);
        initY = e.touches ? e.touches[0].clientY : e.clientY;
        initHeight = containerRef.current.offsetHeight;
    }

    const resizeStop = () => {
        document.removeEventListener("touchmove", onResize);
        document.removeEventListener("mousemove", onResize);
        document.removeEventListener("mouseup", resizeStop);
        document.removeEventListener("touchend", onResize);
    }

    const onResize = (e) => {
        containerRef.current.style.height = initHeight + ((e.touches ? e.touches[0].clientY : e.clientY) - initY) + "px";
    }

    useEffect(() => {
        const tvWidget = new window.TradingView.widget({
            debug: false,
            fullscreen: false,
            autosize: true,
            theme: "Dark",
            symbol: props.title,
            interval: '4h',
            container: chartViewerRef.current,
            datafeed: new UDFCompatibleDatafeed(props.pair, props.network),
            library_path: "charting_library/",
            enabled_features: [],
            disabled_features: ["header_symbol_search", "symbol_search_hot_key", "header_compare"],
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            //locale: Intl.DateTimeFormat().resolvedOptions().locale
        });

        return () => tvWidget?.remove();
    }, [props]);

    return (
        <div ref={containerRef} className='position-relative' style={{height: "100%", minHeight: 400}}>
            <div ref={chartViewerRef} className="chart"></div>
            <div className='resizer fa fa-arrows-v' onMouseDown={resizeStart} onMouseOut={resizeStop} onMouseUp={resizeStop} onTouchStart={resizeStart} onTouchEnd={resizeStop}></div>
        </div>
    );
}

export { Chart }
