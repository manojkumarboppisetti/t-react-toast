import React from "react";
import "./ToastComponent.scss";
import {IToast, ToastPlacement} from "../shared/toast.model";
import closeIcon from "./toast-icons/close.svg";
import successIcon from "./toast-icons/success.svg";
import infoIcon from "./toast-icons/info.svg";
import errorIcon from "./toast-icons/error.svg";
import warningIcon from "./toast-icons/warning.svg";
import defaultIcon from "./toast-icons/default.svg";
import {useCallback, useEffect, useState} from "react";
import {ClearAllToastSubject, ToastSubject} from "../ToastService/toast.service";
import moment, {Moment} from "moment";
import {ToastDuration} from "../shared/toast.contants";

interface ToastProps {
    position?: ToastPlacement;
    showDebugInfo?: boolean;
}

const ToastIconMappings: any = {
    success: successIcon,
    info: infoIcon,
    error: errorIcon,
    warning: warningIcon,
    default: defaultIcon
};

interface IToastMessage extends IToast {
    id: string;
    publishedAt: Moment;
    expireAt: Moment;
}

const ToastComponent = (props: ToastProps) => {

    const {position = 'top-right', showDebugInfo} = props;
    const [toastMessages, setToastMessages] = useState<IToastMessage[]>([]);

    const getRandomID = useCallback((length: number) => {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }, []);

    useEffect(() => {
        const sub = ToastSubject.subscribe((toastMessage: IToast) => {
            setToastMessages((toastMessages) => {
                return [{
                    ...toastMessage,
                    id: getRandomID(10),
                    duration: toastMessage?.duration || ToastDuration,
                    publishedAt: moment(),
                    expireAt: moment().add(toastMessage?.duration || ToastDuration, 'milliseconds')
                }, ...toastMessages];
            });
        });
        return () => {
            sub.unsubscribe();
        }
    }, []);

    useEffect(() => {
        const sub = ClearAllToastSubject.subscribe(() => {
            setToastMessages([]);
        })
        return () => {
            sub.unsubscribe();
        }
    }, []);

    const deleteToastMessage = useCallback((toastMessage: IToastMessage) => {
        setToastMessages((toastMessages) => {
            return toastMessages.filter((toastMessageItem) => toastMessageItem.id !== toastMessage.id);
        });
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setToastMessages((toastMessages) => {
                return toastMessages.filter((toastMessageItem) => moment().isBefore(toastMessageItem.expireAt));
            });
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`toast-component ${position}`}>
            {
                toastMessages.map((toastMessage) => {
                    const {
                        heading = 'default',
                        message,
                        type = 'default',
                        publishedAt,
                        id,
                        duration,
                        expireAt
                    } = toastMessage;
                    const publishedTime = publishedAt.format('DD.MM.YY hh:mm:ss a');
                    const remainingDurationInSec = Math.round((Math.abs(moment().diff(expireAt)) / 1000));
                    const remainingDurationInPercentage = duration ? Math.round(((Math.abs(moment().diff(expireAt))) / duration) * 100) : 0;
                    return <div className={`toast-message-container ${position} ${type}`} key={id}>
                        <div className={`toast-message-wrapper`}>
                            <div className="toast-message-icon">
                                <img src={ToastIconMappings[type]}/>
                            </div>
                            <div className="toast-message-data">
                                <div className="toast-message-header">
                                    <div className="toast-message-heading">
                                        {heading}
                                    </div>
                                    <div className="toast-message-close" onClick={() => {
                                        deleteToastMessage(toastMessage);
                                    }}>
                                        <img src={closeIcon}/>
                                    </div>
                                </div>
                                <div className="toast-message-description">
                                    {message}
                                </div>
                                {showDebugInfo && <div
                                    className='toast-message-debug-info'>
                                    Published At: {publishedTime}&nbsp;
                                    ( {remainingDurationInSec} s )&nbsp;
                                </div>}
                            </div>
                        </div>
                        {
                            // @ts-ignore
                            <div style={{'--value': `${remainingDurationInPercentage}`}}
                                 className="toast-message-progressbar" aria-valuemin="0" aria-valuemax="100"></div>
                        }
                        {/*{<div className={"toast-message-duration"}*/}
                        {/*      style={{width: `${remainingDurationInPercentage}%`}}/>}*/}
                    </div>
                })
            }
        </div>
        // <>
        //     <div>ToastComponent</div>
        // </>
    );

};

export default ToastComponent;
