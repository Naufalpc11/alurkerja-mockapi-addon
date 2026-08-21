import React from 'react';

type DataRecord = Record<string, unknown>;

type FieldItem = {
    name?: string;
    disabled?: boolean;
    constraints?: {
        required?: boolean;
    };
    [key: string]: unknown;
};

type FormMethods = {
    register?: (name: string, options?: Record<string, unknown>) => Record<string, unknown>;
    watch?: (name: string) => unknown;
    getValues?: (name?: string) => unknown;
    control?: any;
};

type RawMfeProps = {
    props?: {
        form?: FormMethods;
        item?: FieldItem;
    };
    form?: FormMethods;
    item?: FieldItem;
    alurkerjaParams?: DataRecord;
};

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

// Mendukung format YYYY-MM-DD, DD-MM-YYYY, dan ISO.
const parseDateValue = (value: unknown): Date | null => {
    if (typeof value !== 'string' || !value) return null;

    const ymd = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymd) {
        const date = new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const dmy = value.match(/^(\d{2})-(\d{2})-(\d{4})/);
    if (dmy) {
        const date = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const calculateTotalDays = (startValue: unknown, endValue: unknown): number | null => {
    const startDate = parseDateValue(startValue);
    const endDate = parseDateValue(endValue);

    if (!startDate || !endDate || endDate.getTime() < startDate.getTime()) {
        return null;
    }

    return Math.round((endDate.getTime() - startDate.getTime()) / DAY_IN_MILLISECONDS) + 1;
};

const isRecord = (value: unknown): value is DataRecord => (
    typeof value === 'object' && value !== null && !Array.isArray(value)
);

const getNestedRecord = (source: unknown, key: string): DataRecord | undefined => {
    if (!isRecord(source)) return undefined;

    const nestedValue = source[key];
    return isRecord(nestedValue) ? nestedValue : undefined;
};

const hasDisplayValue = (value: unknown) => (
    value !== undefined && value !== null && value !== ''
);

const toDisplayText = (value: unknown): string => {
    if (!hasDisplayValue(value)) return '-';
    return typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : JSON.stringify(value);
};

const formatDate = (value: unknown): string => {
    const date = parseDateValue(value);
    if (!date) return toDisplayText(value);

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(date);
};

// Platform memanggil field MFE dengan bentuk { props: { form, item }, alurkerjaParams }.
// Bentuk lama { form, item, alurkerjaParams } tetap didukung.
const normalizeMfeProps = (
    props: RawMfeProps | undefined,
): { form: FormMethods | undefined; item: FieldItem | undefined; alurkerjaParams?: DataRecord } => {
    const hasNestedProps = Boolean(props && props.props && (props.props.form || props.props.item));
    const effective = hasNestedProps && props ? props.props : props;

    return {
        form: effective?.form,
        item: effective?.item,
        alurkerjaParams: props?.alurkerjaParams,
    };
};

const LeaveDetailView = (props: RawMfeProps) => {
    const { form, item, alurkerjaParams } = normalizeMfeProps(props);
    const { watch, getValues } = form || {};

    // Baca nilai dari berbagai bentuk data yang dikirimkan platform,
    // baik nama datar (tanggal_mulai) maupun struktur { value: { ... } }.
    const getValue = (fieldName: string): unknown => {
        const prefixedName = `value.${fieldName}`;
        const watchedPrefixed = typeof watch === 'function' ? watch(prefixedName) : undefined;
        const watchedFlat = typeof watch === 'function' ? watch(fieldName) : undefined;
        const staticPrefixed = typeof getValues === 'function' ? getValues(prefixedName) : undefined;
        const staticFlat = typeof getValues === 'function' ? getValues(fieldName) : undefined;
        const allFormValues = typeof getValues === 'function' ? getValues() : undefined;

        const sources: unknown[] = [
            watchedPrefixed,
            watchedFlat,
            staticPrefixed,
            staticFlat,
            getNestedRecord(allFormValues, 'value')?.[fieldName],
            isRecord(allFormValues) ? allFormValues[fieldName] : undefined,
            alurkerjaParams?.[fieldName],
            getNestedRecord(alurkerjaParams, 'value')?.[fieldName],
            getNestedRecord(alurkerjaParams, 'variables')?.[fieldName],
            getNestedRecord(alurkerjaParams, 'processVariables')?.[fieldName],
            getNestedRecord(alurkerjaParams, 'process_variables')?.[fieldName],
            item?.[fieldName],
            getNestedRecord(item, 'value')?.[fieldName],
            getNestedRecord(item, 'variables')?.[fieldName],
        ];

        return sources.find(hasDisplayValue);
    };

    const startDate = getValue('tanggal_mulai');
    const endDate = getValue('tanggal_selesai');

    // Pakai nilai total yang tersimpan, atau hitung ulang dari tanggal jika kosong.
    const storedTotal = getValue('total_hari');
    const computedTotal = calculateTotalDays(startDate, endDate);
    const totalDays = hasDisplayValue(storedTotal) ? storedTotal : computedTotal;
    const reason = getValue('alasan_cuti');

    return (
        <section
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mt-4"
            aria-labelledby="leave-detail-title"
        >
            <div className="bg-blue-600 px-6 py-4 flex flex-wrap gap-3 justify-between items-center">
                <div>
                    <h3 id="leave-detail-title" className="text-white font-bold text-lg m-0">
                        Ringkasan Pengajuan Cuti
                    </h3>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Hanya Lihat
                </span>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1 font-semibold">Tanggal Mulai</p>
                        <p className="font-bold text-gray-800 text-lg m-0">{formatDate(startDate)}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1 font-semibold">Tanggal Selesai</p>
                        <p className="font-bold text-gray-800 text-lg m-0">{formatDate(endDate)}</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded border border-blue-100 md:col-span-2 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 mb-1 font-semibold">Total Durasi Cuti</p>
                            <p className="font-bold text-3xl text-blue-800 m-0">
                                {toDisplayText(totalDays)}{hasDisplayValue(totalDays) ? ' Hari' : ''}
                            </p>
                        </div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-blue-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>

                    <div className="md:col-span-2">
                        <p className="text-sm text-gray-500 mb-1 font-semibold">Alasan Cuti</p>
                        <div className="bg-gray-50 p-4 rounded border border-gray-100 min-h-[80px]">
                            <p className="text-gray-700 whitespace-pre-wrap break-words m-0">
                                {toDisplayText(reason)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LeaveDetailView;