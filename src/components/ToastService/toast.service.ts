import {IToast} from "../shared/toast.model";
import {Subject} from "rxjs";
import {ToastDuration} from "../shared/toast.contants";

export const ToastSubject = new Subject<IToast>();
export const ClearAllToastSubject = new Subject<undefined>();

const showToast = (config: IToast) => {
    const {
        type = 'default',
        message,
        duration = ToastDuration
    } = config;
    const heading = config.heading || config.type;
    ToastSubject.next({
        type,
        message,
        heading,
        duration,
    });
}

const clearAllToasts = () => {
    ClearAllToastSubject.next(undefined);
}

const ToastService = {
    showToast,
    clearAllToasts
}

export default ToastService;
