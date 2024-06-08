import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import clsx from 'clsx';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAsync } from 'react-use';

import Button from '@/components/Button';
import Input from '@/components/Input';
import Select, { Option } from '@/components/Select';
import { UpdateTaskRequestDto } from '@/interfaces/request/CreateTaskRequestDto';
import { BaseResponseDto } from '@/interfaces/Response/BaseResponseDto';
import { TaskResponseDto } from '@/interfaces/Response/TaskResponseDto';
import { TrainerResponseDto } from '@/interfaces/Response/TrainerResponseDto';
import { decodeJwt, getValue } from '@/utils/application';
import { executeGetWithPagination, executePutWithBody } from '@/utils/http-client';

import styles from './detail.module.scss';

const TaskDetail = () => {
    const token = getValue('token');
    const [auth] = useState(decodeJwt(token || ""));
    const location = useLocation();
    const [receiverId] = useState<number>(location.state.receiverId);

    const [requestDto, setRequestDto] = useState<UpdateTaskRequestDto>(
        {
            taskName: "",
            taskInfomations: "string",
            status: 0,
            priority: 0,
            receiverId: 0
        }
    );
    const updateTask = async () => {
        try {
            const { data }: { data: BaseResponseDto<string> } = await executePutWithBody(`/api/Task/${location.state.taskId}`, requestDto);
            if (data.hasError === false) {
                toast.success('Xóa nhiệm vụ thành công');
                navigate('/tasks');
            }
            else {
                toast.error('Xóa nhiệm vụ thất bại');
            }
            // toast.success('Update Task successfully');
            // console.log(requestDto)
        } catch (error) {
            // toast.error('Update Task Error!');
        } finally {
            // navigate('/tasks');
        }
    }

    const handleInputChange = (key: keyof UpdateTaskRequestDto, value: string | number) => {
        setRequestDto((prev) => ({ ...prev, [key]: value }));
    };

    const optionPriorities = [
        { "priorityName": "Low", "value": "Low", "id": 1 },
        { "priorityName": "Medium", "value": "Medium", "id": 2 },
        { "priorityName": "High", "value": "High", "id": 3 },
    ]
    const optionStatus = [
        { "statusName": "Inprocess", "value": "Inprocess", "id": 1 },
        { "statusName": "Finished", "value": "Finished", "id": 2 },
    ]

    const getStatusId = (statusText: string) => {
        if (statusText == "InProcess") {
            return 1
        }
        else if (statusText == "Finished") {
            return 2
        }
        else {
            return 0
        }
    }

    const getPriorityId = (statusText: string) => {
        if (statusText == "Low") {
            return 1
        }
        else if (statusText == "Medium") {
            return 2
        }
        else {
            return 3
        }
    }

    let id = location.state.taskId;
    const { value } = useAsync(async () => {
        try {
            const { data }: { data: BaseResponseDto<TaskResponseDto> } = await executeGetWithPagination(
                `/api/Task/${id}`,
                { pageIndex: 1, pageSize: 1000000 },
            );
            console.log(value);
            // setReceiverId(data.data.receivers.id)
            setRequestDto({
                taskName: data.data.taskName,
                taskInfomations: data.data.taskInfomations,
                status: getStatusId(data.data.status),
                priority: getPriorityId(data.data.priority),
                receiverId: data.data.receivers.id
            })
            return data.data;
        } catch (error) {
            console.error(error);
        }
    });


    const { value: allTrainer } = useAsync(async () => {
        try {
            const { data }: { data: BaseResponseDto<TrainerResponseDto[]> } = await executeGetWithPagination(
                `/api/User/trainers`,
                { pageIndex: 1, pageSize: 1000000 },
            );
            return data.data;
        } catch (error) {
            console.error(error);
        }
    });
    const trainersOptions: Option[] = allTrainer ? allTrainer.map((trainer) =>
        ({ label: trainer.lastName + " " + trainer.firstName, value: trainer.id })) : [];

    const { value: trainer } = useAsync(async () => {
        try {
            const { data }: { data: BaseResponseDto<TrainerResponseDto> } = await executeGetWithPagination(
                `/api/User/${receiverId}`,
                { pageIndex: 1, pageSize: 1000000 },
            );
            return data.data;
        } catch (error) {
            console.error(error);
        }
    }, [receiverId]);

    const navigate = useNavigate();

    const handleCancelClick = () => {
        navigate('/tasks');
    };

    const priorityOptions: Option[] = optionPriorities.map((item) => ({ label: item.priorityName, value: item.id }));
    const priorityStatus: Option[] = optionStatus.map((item) => ({ label: item.statusName, value: item.id }));

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span>Nhiệm vụ</span>
            </div>
            {value && <div className={styles.form}>
                {/* Khach Hang */}
                <div>
                    <div className={styles.cardsuperbig}>
                        <div className={styles.title}>
                            <span>Thông tin nhiệm vụ</span>
                        </div>
                        <div className={styles.inputs}>
                            <div className={styles['group-13']}>
                                <div className={styles.tools}>
                                    {/* <div className={styles.tools}> Khách hàng </div> */}
                                </div>
                                <Input
                                    label="Tên nhiệm vụ"
                                    className={styles.input}
                                    handleChange={(_, value) => handleInputChange('taskName', String(value))}
                                    defaultValue={value.taskName}
                                />
                                <div className={styles.flexbox}>
                                    {/* <Input
                                label="Độ ưu tiên"
                                className={styles.input}
                                handleChange={(_, value) => handleInputChange('priority', String(value))}
                                defaultValue={value.priority}
                            /> */}
                                    <Select
                                        className={styles.input}
                                        label="Độ ưu tiên"
                                        options={priorityOptions}
                                        onChange={
                                            (value) => {
                                                console.log(value);
                                                handleInputChange('priority', Number(value));
                                            }
                                        }
                                        defaultValue={getPriorityId(value.priority)}
                                    />
                                    {/* <Input
                                label="Trạng thái"
                                className={styles.input}
                                handleChange={(_, value) => handleInputChange('status', String(value))}
                                defaultValue={value.status}
                            /> */}
                                    <Select
                                        className={styles.input}
                                        label="Trạng thái"
                                        options={priorityStatus}
                                        onChange={
                                            (value) => {
                                                handleInputChange('status', Number(value));
                                            }
                                        }
                                        defaultValue={getStatusId(value.status)}
                                    />
                                </div>
                                <Input
                                    label="Thời gian tạo"
                                    className={styles.input}
                                    handleChange={() => { }}
                                    value={new Date(value.createdDate as Date).toLocaleDateString('en-us', { year: "numeric", month: "short", day: "numeric" })}
                                />
                                <Input
                                    label="Thời gian sửa đổi"
                                    className={styles.input}
                                    handleChange={() => { }}
                                    value={new Date(value.updatedDate as Date).toLocaleDateString('en-us', { year: "numeric", month: "short", day: "numeric" })}
                                />
                            </div>
                            <div className={styles['group-1']}>
                                <div className={styles.tools}>
                                    {/* <div className={styles.tools}> Khách hàng </div> */}
                                </div>
                                <CKEditor
                                    editor={ClassicEditor}
                                    data={value.taskInfomations}
                                    onReady={editor => {
                                        // You can store the "editor" and use when it is needed.
                                        console.log('Editor is ready to use!', editor);
                                    }}
                                        onChange={(_event, editor) => {
                                        const data = editor.getData();
                                            handleInputChange('taskInfomations', data);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Khach Hang */}
                <div>
                    <div className={styles.cardsmall}>
                        <div className={styles.title}>
                            <span>Người nhận nhiệm vụ</span>
                            {allTrainer && value.receivers && <Select
                                className={styles.input}
                                options={trainersOptions}
                                onChange={(value) => { handleInputChange("receiverId", value as number) }}
                                defaultValue={receiverId} />}
                        </div>
                        <div className={styles.inputs}>
                            <div className={styles['group-1']}>
                                <div className={styles.tools}>
                                    {/* <div className={styles.tools}> Khách hàng </div> */}
                                </div>
                                <div className={styles.card__content}>
                                    <Input
                                        label="Họ và tên"
                                        className={styles.input}
                                        handleChange={() => { }}
                                        value={trainer?.lastName + " " + trainer?.firstName}
                                        disabled
                                    />
                                    <Input
                                        label="Số điện thoại"
                                        className={styles.input}
                                        handleChange={() => { }}
                                        value={trainer?.phone}
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className={styles['group-1']}>
                                <div className={styles.tools}>
                                    {/* <div className={styles.tools}> Khách hàng </div> */}
                                </div>
                                <div className={styles.card__content}>
                                    <Input
                                        label="Email"
                                        className={styles.input}
                                        handleChange={() => { }}
                                        value={trainer?.email}
                                        disabled
                                    />
                                    <Input
                                        label="Địa chỉ"
                                        className={styles.input}
                                        handleChange={() => { }}
                                        value={trainer?.address}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>}
            <div className={styles.buttons}>
                <div className={styles.group}>
                    <div />
                    <Button content={<span>Trở về</span>} className={clsx(styles.button, styles.cancel)} onClick={handleCancelClick} />
                    {
                        (auth?.payload?.roles === "Manager" || auth?.payload?.roles === "Staff") &&
                        <Button
                            content={<span>Lưu</span>}
                            className={styles.button}
                            onClick={() => { updateTask() }}
                        />
                    }
                </div>
            </div>
        </div>
    );
};

export default TaskDetail;