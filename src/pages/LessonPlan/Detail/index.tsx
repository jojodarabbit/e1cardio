import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { faDeleteLeft, faSquarePlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { makeStyles } from '@mui/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import clsx from 'clsx';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAsync } from 'react-use';

import Button from '@/components/Button';
import { TrainingPrograms } from '@/components/Icons';
import Input from '@/components/Input';
import Loader from '@/components/Loading/Loader';
import Select, { Option } from '@/components/Select';
import Textarea from '@/components/Textarea';
import { BaseResponseDto } from '@/interfaces/Response/BaseResponseDto';
import { BranchResponseDto } from '@/interfaces/Response/BranchResponseDto';
import { sessionUpdate } from '@/interfaces/Response/LessonPlanResponseDto';
import { Schedule, session, sessionItems } from '@/interfaces/Response/LessonPlanResponseDto';
import { UpdatePackageRequestDto } from '@/interfaces/Response/LessonPlanResponseDto';
import { TrainerResponseDto } from '@/interfaces/Response/TrainerResponseDto';
import { StaffManagementResponseDto } from '@/interfaces/Response/UserManagementResponseDto';
import { decodeJwt, getValue } from '@/utils/application';
import { executeGetWithPagination, executePutWithBody } from '@/utils/http-client';

import styles from './create.module.scss';
const CreatePackage = () => {

    const location = useLocation();
    let packageId = location.state.packageId;
    const token = getValue('token');
    const [auth] = useState(decodeJwt(token || ""));
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [listSchedules, setListSchedules] = useState<Schedule[]>([]);
    const [listSession, setListSession] = useState<sessionUpdate[]>([]);
    const [scheduleItem, setScheduleItem] = useState<Schedule>({
        day: 0,
        time: {
            hour: 0,
            minute: 0
        }
    });
    const [, setSessionTemp] = useState<session>({
        descriptions: '',
        energyPoint: 0,
        outcome: '',
        sessionItems: [],
        title: ''
    });
    const [requestDto, setRequestDto] = useState<UpdatePackageRequestDto>({
        branchId: 0,
        descriptions: '',
        numberOfDays: 0,
        numberOfSessions: 0,
        packageName: '',
        imageUrl: '',
        schedules: listSchedules,
        sessions: listSession as sessionUpdate[],
        startDate: new Date(),
        endDate: new Date(),
        packagePrice: 0,
        type: '',
        branch: {
            id: 0,
            branchName: '',
            location: '',
            phone: ''
        },
        id: 0,
        packageCreator: {
            email: '',
            firstName: '',
            id: 0,
            lastName: '',
            phone: '',
        },
        packageFollower: {
            email: '',
            firstName: '',
            id: 0,
            lastName: '',
            phone: '',
        },
        packageFollowerId: 0,
        packageTrainer: {
            email: '',
            firstName: '',
            id: 0,
            lastName: '',
            phone: '',
        },
        packageTrainerId: 0,
        status: 0
    });
    enum DaysOfWeek {
        Sunday = 0,
        Monday = 1,
        Tuesday = 2,
        Wednesday = 3,
        Thursday = 4,
        Friday = 5,
        Saturday = 6
    }
    const daysInWeek = [
        { number: 0, date: "Sunday" },
        { number: 1, date: "Monday" },
        { number: 2, date: "Tuesday" },
        { number: 3, date: "Wednesday" },
        { number: 4, date: "Thursday" },
        { number: 5, date: "Friday" },
        { number: 6, date: "Saturday" },
    ]
    useAsync(async () => {
        try {
            const { data }: { data: BaseResponseDto<UpdatePackageRequestDto>; } = await executeGetWithPagination(
                `/api/Package/${packageId}`,
                { pageIndex: 1, pageSize: 1000000 }
            );
            console.log(data);
            setRequestDto(data.data);
            setListSchedules(data.data.schedules);
            return data.data;
        } catch (error) {
            console.error(error);
        }
    });

    const daysInWeekOptions: Option[] = daysInWeek ? daysInWeek.map((branch) => ({ label: branch.date, value: branch.number })) : [];

    const useStyles = makeStyles(() => ({
        timePicker: {
            '& .MuiInputBase-root': {
                'height': '52px',
                'overflow': 'hidden',
                'margin-bottom': '12px',
                'background-color': 'white',
                'border-radius': '10px',
            },
        },
    }));
    const classes = useStyles();
    const { loading, value } = useAsync(async () => {
        try {
            const { data }: { data: BaseResponseDto<BranchResponseDto[]> } = await executeGetWithPagination(
                '/api/Branch',
                { pageIndex: 1, pageSize: 1000000 },
            );
            return data.data;
        } catch (error) {
            console.error(error);
        }
    });

    const options: Option[] = value ? value.map((branch) => ({ label: branch.branchName, value: branch.id })) : [];

    const { loading: _loading, value: AllStaff } = useAsync(async () => {
        try {
            const { data }: { data: BaseResponseDto<StaffManagementResponseDto[]> } = await executeGetWithPagination(
                '/api/User/staffs',
                { pageIndex: 1, pageSize: 1000000 },
            );
            return data.data;
        } catch (error) {
            console.error(error);
        }
    });

    const staffOptions: Option[] = AllStaff ? AllStaff.map((staff) => ({ label: staff.lastName + " " + staff.firstName, value: staff.id })) : [];

    const { loading: __loading, value: AllTrainer } = useAsync(async () => {
        try {
            const { data }: { data: BaseResponseDto<TrainerResponseDto[]> } = await executeGetWithPagination(
                '/api/User/trainers',
                { pageIndex: 1, pageSize: 1000000 },
            );
            return data.data;
        } catch (error) {
            console.error(error);
        }
    });

    const trainerOptions: Option[] = AllTrainer ? AllTrainer.map((trainer) => ({ label: trainer.lastName + " " + trainer.firstName, value: trainer.id })) : [];

    const handleInputChange = (key: keyof UpdatePackageRequestDto, value: string | number) => {
        setRequestDto((prev) => ({ ...prev, [key]: value }));
    };


    const handleUpdateClick = async () => {
        try {
            setIsLoading(true);
            const { data }: { data: BaseResponseDto<string> } = await executePutWithBody(`/api/Package/${packageId}`, requestDto);
            if (data.hasError === false) {
                toast.success('Cập nhật giáo án thành công');
                navigate('/lessonPlan');
            }
            else {
                toast.error('Cập nhật giáo án thất bại');
            }
            // console.log(requestDto);
        } catch (error) {
            // toast.error('Create Package Error!');
        } finally {
            setIsLoading(false);
        }
    };
    const navigate = useNavigate();

    const handleCancelClick = () => {
        navigate('/packages');
    };

    const handleRemoveSchedule = (day: number, time: {
        hour: number,
        minute: number
    }) => {
        console.log({ day, time });
        let i = 0;
        listSchedules.forEach(element => {
            if (element.day === day && element.time === time) {
                let listSchedule: Schedule[] = listSchedules;
                listSchedule.splice(i, 1);
                setListSchedules([...listSchedule])
                let a = requestDto;
                requestDto.schedules = [...listSchedule];
                setRequestDto(a);
            }
            i++;
        });
    }

    const handleRemoveSessonItem = (sesIndex: number, sesItemIndex: number) => {
        let a = requestDto.sessions;
        a[sesIndex].sessionItems = a[sesIndex].sessionItems.filter(x => x !== a[sesIndex].sessionItems[sesItemIndex]);
        setListSession(a);
        setRequestDto({
            ...requestDto,
            sessions: a
        })
        // let a = requestDto.sessions;
        // a[index].sessionItems.push({
        //     description: '',
        //     imageUrl: '',
        //     title: '',
        //     id: 0
        // });
        // setRequestDto({
        //     ...requestDto,
        //     sessions: a
        // })    
    }

    const handleRemoveSesson = (sesIndex: number) => {
        let a = requestDto;
        a.sessions = a.sessions.filter(x => x !== a.sessions[sesIndex]);
        setRequestDto({
            ...requestDto,
            sessions: a.sessions
        })
    }
    const handleAddSchedule = () => {
        const isObjectInList = listSchedules.some(item => item.day === scheduleItem.day && item.time === scheduleItem.time);
        if (isObjectInList == false) {
            setListSchedules([...listSchedules, scheduleItem]);
        }
        let a = requestDto;
        requestDto.schedules = [...listSchedules, scheduleItem];
        setRequestDto(a);
    }
    const handleExerciseChange = (key: keyof sessionItems, value: string | number, sesIndex: number, sesItemIndex: number) => {
        setSessionTemp((prev) => ({ ...prev, [key]: value }));
        let a = requestDto.sessions;
        if (key === "title") {
            a[sesIndex].sessionItems[sesItemIndex].title = value as string
        }
        else if (key === "description") {
            a[sesIndex].sessionItems[sesItemIndex].description = value as string
        }
        setListSession(a)
        setRequestDto({
            ...requestDto,
            sessions: a
        })

    }
    const handleTempSessionChange = (key: keyof sessionUpdate, value: string | number, sesIndex: number) => {
        setSessionTemp((prev) => ({ ...prev, [key]: value }));

        let a = requestDto.sessions;
        if (key === "title") {
            a[sesIndex].title = value as string
        }
        else if (key === "descriptions") {
            a[sesIndex].descriptions = value as string
        }
        else if (key === "energyPoint") {
            a[sesIndex].energyPoint = value as number
        }
        else if (key === "outcome") {
            a[sesIndex].outcome = value as string
        }
        setListSession(a)
        setRequestDto({
            ...requestDto,
            sessions: a
        })
        console.log(a);
    };
    const handleAddSession = () => {
        let a = requestDto;
        a.sessions = [...requestDto.sessions, {
            descriptions: '',
            energyPoint: 0,
            outcome: '',
            sessionItems: [],
            title: '',
            branch: {
                branchName: '',
                id: 0,
                location: '',
                phone: ''
            },
            branchId: 0,
            id: 0,
            isFinished: false,
            sessionTrainer: {
                email: '',
                firstName: '',
                id: 0,
                lastName: '',
                phone: ''
            },
            sessionTrainerId: 0
        }]
        setRequestDto({
            ...requestDto,
            sessions: a.sessions
        })
    }
    const addSessionItem = (index: number) => {

        let a = requestDto.sessions;
        a[index].sessionItems.push({
            description: '',
            imageUrl: '',
            title: '',
            id: 0
        });
        setRequestDto({
            ...requestDto,
            sessions: a
        })
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <TrainingPrograms />
                <span>Giáo án</span>
            </div>
            {loading ? (
                <Loader />
            ) : (
                <div>
                    <div className={styles.form}>
                        <div className={styles.title}>
                            <span>Thông tin cơ bản</span>
                        </div>
                        <div className={styles.inputs}>
                            <div className={styles['group-1']}>
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzt2pl-jBxZQRauAMdzkQD8xjIHpPnjPus5w&s" className={styles.avatar} id='profile-pic'></img>
                                <Input
                                    label="Tên giáo án"
                                    className={styles.input}
                                    handleChange={(_, value) => handleInputChange('packageName', String(value))}
                                    defaultValue={requestDto.packageName}
                                />
                                <Select
                                    className={styles.input}
                                    label="Cơ sở"
                                    options={options}
                                    onChange={(value) => handleInputChange('branchId', Number(value))}
                                    defaultValue={requestDto.branch.id}
                                />
                                <div className={styles.timeSelect}>
                                    <Select
                                        className={styles.input}
                                        label="Thời gian tập"
                                        options={daysInWeekOptions}
                                        onChange={(value) => {
                                            setScheduleItem({ day: +value, time: scheduleItem.time })
                                        }}
                                        defaultValue={scheduleItem.day}
                                    />
                                    <LocalizationProvider dateAdapter={AdapterDayjs} >
                                        <DemoContainer components={['TimePicker']}>
                                            <TimePicker
                                                className={classes.timePicker}
                                                onChange={(value) => {
                                                    setScheduleItem({
                                                        day: scheduleItem.day, time: {
                                                            hour: value?.hour() as number,
                                                            minute: value?.minute() as number
                                                        }
                                                    })
                                                }}
                                            />
                                        </DemoContainer>
                                    </LocalizationProvider>
                                    <FontAwesomeIcon icon={faSquarePlus} className={styles.icon} onClick={handleAddSchedule} />
                                </div>
                                <div className={styles.scheduleContainer}>
                                    {requestDto.schedules.map((schedule, index) => (
                                        <div key={index} className={styles.schedule}>
                                            {DaysOfWeek[schedule.day]} - {schedule.time.hour < 10 ? "0" + schedule.time.hour : schedule.time.hour}:{schedule.time.minute < 10 ? "0" + schedule.time.minute : schedule.time.minute}
                                            <FontAwesomeIcon icon={faDeleteLeft} className={styles.iconRemove} onClick={() => handleRemoveSchedule(schedule.day, schedule.time)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div>
                                    <div className={styles['group-2']}>
                                        {/* <Input
                                        label="Giá"
                                        className={styles.input}
                                        fixedplaceholder="đ"
                                        handleChange={(_, value) => handleInputChange('packagePrice', String(value))}
                                        type="number"
                                    /> */}
                                        <Input
                                            label="Số buổi"
                                            className={styles.input}
                                            fixedplaceholder="buổi"
                                            handleChange={(_, value) => handleInputChange('numberOfSessions', String(value))}
                                            type="number"
                                            defaultValue={requestDto.numberOfSessions}
                                        />
                                    </div>
                                    <div className={styles['group-2']}>
                                        {/* <Input
                                        label="Loại gói tập"
                                        className={styles.input}
                                        handleChange={(_, value) => handleInputChange('type', String(value))}
                                    /> */}
                                        <Input
                                            label="Số ngày dự kiến hoàn thành"
                                            className={styles.input}
                                            fixedplaceholder="ngày"
                                            handleChange={(_, value) => handleInputChange('numberOfDays', String(value))}
                                            type="number"
                                            defaultValue={requestDto.numberOfDays}
                                        />
                                    </div>
                                    <div className={styles['group-2']}>
                                        <Input label="Ngày bắt đầu" className={styles.input}
                                            handleChange={(_, x) => {
                                                let a = requestDto;
                                                requestDto.startDate = new Date(String(x));
                                                setRequestDto(a);
                                            }}
                                            type="date"
                                            defaultValue={requestDto.startDate.toString().split("T")[0]}
                                        />
                                        <Input label="Ngày kết thúc" className={styles.input}
                                            handleChange={(_, x) => {
                                                let a = requestDto;
                                                requestDto.endDate = new Date(String(x));
                                                setRequestDto(a);
                                            }}
                                            type="date"
                                            defaultValue={requestDto.endDate.toString().split("T")[0]}
                                        />
                                    </div>
                                </div>
                                <CKEditor
                                    editor={ClassicEditor}
                                    data={requestDto.descriptions}
                                    onReady={editor => {
                                        // You can store the "editor" and use when it is needed.
                                        console.log('Editor is ready to use!', editor);
                                    }}
                                    onChange={(_event, editor) => {
                                        const data = editor.getData();
                                        handleInputChange('descriptions', data);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    {
                        auth?.payload?.roles === "Manager" && <div className={styles.form}>
                            <div className={styles.title}>
                                <span>Thông tin huấn luyện viên</span>
                            </div>
                            <div className={styles.inputs}>
                                <div className={styles['group-1']}>
                                    <div className={styles.title2}>
                                        <h2>HLV tạo giáo án</h2>
                                    </div>
                                    <Input
                                        label="Họ và tên"
                                        className={styles.input}
                                        handleChange={(_, value) => handleInputChange('packageName', String(value))}
                                        defaultValue={requestDto.packageCreator.lastName + " " + requestDto.packageCreator.firstName}
                                        disabled
                                    />
                                    <Input
                                        label="Số điện thoại"
                                        className={styles.input}
                                        handleChange={(_, value) => handleInputChange('packageName', String(value))}
                                        defaultValue={requestDto.packageCreator.phone}
                                        disabled
                                    />
                                    <Input
                                        label='Giá'
                                        className={styles.input}
                                        handleChange={(_, value) => handleInputChange('packagePrice', String(value))}
                                        defaultValue={requestDto.packagePrice}
                                        type='number'
                                    />
                                    <Input
                                        label="Loại"
                                        className={styles.input}
                                        handleChange={(_, value) => handleInputChange('type', String(value))}
                                        defaultValue={requestDto.type}
                                    />
                                </div>
                                <div>
                                    <div>
                                        <div className={styles['group-2']}>
                                            <div className={styles.flexCha}>
                                                <div className={styles.title2}>
                                                    <h2>Staff theo dõi</h2>
                                                </div>
                                                <Select
                                                    className={styles.input}
                                                    options={staffOptions}
                                                    onChange={(value) => handleInputChange('packageFollowerId', Number(value))}
                                                    defaultValue={requestDto.packageFollowerId}

                                                />
                                            </div>
                                            <div className={styles.flexCha}>
                                                <div className={styles.title2}>
                                                    <h2>Huấn luyện viên dạy giáo án</h2>
                                                </div>
                                                <Select
                                                    className={styles.input}
                                                    options={trainerOptions}
                                                    onChange={(value) => handleInputChange('packageTrainerId', Number(value))}
                                                    defaultValue={requestDto.packageTrainerId}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                    <div className={styles.form}>
                        {/* Buoi tap */}
                        <Button
                            content={<span>Thêm buổi tập</span>}
                            className={styles.buttonSession}
                            onClick={handleAddSession}
                            loading={isLoading}
                        />
                        {requestDto.sessions.map((ses, sesIndex) => (
                            <div key={sesIndex} className={styles.newbox}>
                                <div className={styles.title}>
                                    <span>Thông tin buổi tập</span>
                                    <FontAwesomeIcon icon={faTrashCan} className={styles.delete} onClick={() => handleRemoveSesson(sesIndex)} />
                                </div>
                                <div className={styles.inputs}>
                                    <div className={styles['group-1']}>
                                        <Input
                                            label="Tiêu đề"
                                            className={styles.input}
                                            handleChange={(_, value) => handleTempSessionChange('title', String(value), sesIndex)}
                                            value={ses.title}
                                        />
                                        <Input
                                            label="Kết quả"
                                            className={styles.input}
                                            handleChange={(_, value) => handleTempSessionChange('outcome', String(value), sesIndex)}
                                            value={ses.outcome}
                                        />
                                        <Input
                                            label="Điểm năng lượng"
                                            className={styles.input}
                                            handleChange={(_, value) => handleTempSessionChange('energyPoint', String(value), sesIndex)}
                                            type='number'
                                            value={ses.energyPoint}

                                        />
                                        {
                                            (auth?.payload?.roles === "Manager" || auth?.payload?.roles === "Staff") && <Select
                                                className={styles.input}
                                                label="Cơ sở"
                                                options={options}
                                                onChange={(value) => handleTempSessionChange('branchId', Number(value), sesIndex)}
                                                defaultValue={ses.branchId}
                                            />
                                        }
                                        <Textarea
                                            label="Mô tả"
                                            className={styles.input}
                                            handleChange={(_, value) => handleTempSessionChange("descriptions", String(value), sesIndex)}
                                            value={ses.descriptions}
                                        />
                                    </div>
                                    <div className={styles['group-1']}>
                                        <Button
                                            content={<span>+</span>}
                                            className={styles.buttonSession}
                                            onClick={() => addSessionItem(sesIndex)}
                                            loading={isLoading}
                                        />
                                        {ses.sessionItems.map((sesItem, sesItemIndex) => (
                                            <div key={sesItemIndex} className={styles.cardSession}>
                                                <div className={styles.flexCha}>
                                                    <Input
                                                        className={styles.input}
                                                        handleChange={(_, value) => {
                                                            handleExerciseChange("title", String(value), sesIndex, sesItemIndex)
                                                        }}
                                                        label={"Tiêu đề"}
                                                        value={sesItem.title}
                                                    />
                                                    <FontAwesomeIcon icon={faTrashCan} className={styles.delete} onClick={() => handleRemoveSessonItem(sesIndex, sesItemIndex)} />
                                                </div>
                                                <div className={styles.flexCha}>
                                                    <Input
                                                        className={styles.input}
                                                        handleChange={(_, value) => {
                                                            handleExerciseChange("description", String(value), sesIndex, sesItemIndex)
                                                        }}
                                                        label={"Mô tả"}
                                                        value={sesItem.description}
                                                    />
                                                    <FontAwesomeIcon icon={faTrashCan} className={styles.hidden} onClick={() => handleRemoveSessonItem(sesIndex, sesItemIndex)} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>))}
                        {/* {isOpenPopupSessionItem && 
                        <div className={styles.newbox2}>            
                            <div className={styles.title}>
                                <span>Bài tập</span>
                            </div>
                            <div className={styles.inputs}>
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzt2pl-jBxZQRauAMdzkQD8xjIHpPnjPus5w&s" className={styles.avatar}></img>
                                <div className={styles['group-3']}>
                                        <Input
                                            label="Tiêu đề"
                                            className={styles.input}
                                            handleChange={(_, value) => handleSessionItemChange('title', String(value))}
                                            value={sessionItem.title}

                                        />
                                        <Textarea
                                            label="Mô tả"
                                            className={styles.input}
                                            handleChange={(_, value) => handleSessionItemChange('description', String(value))}
                                            value={sessionItem.description}
                                        />
                                                            <div className={styles.buttons}>
                                <div className={styles.group}>
                                    <Button content={<span>Trở về</span>} className={clsx(styles.button, styles.cancel, styles.buttonSession)} onClick={togglePopupSessionItem}/>
                                    <Button
                                        content={<span>Thêm</span>}
                                        className={styles.button}
                                        onClick={handleAddExercise(, sesIndex)}
                                        loading={isLoading}
                                    />
                                </div>
                                </div>
                                </div>
                            </div>
                    </div>} */}
                    </div>
                    <div className={styles.buttons}>
                        <div className={styles.group}>
                            <Button content={<span>Hủy</span>} className={clsx(styles.button, styles.cancel, styles.buttonSession)} onClick={handleCancelClick} />
                            <Button
                                content={<span>Lưu</span>}
                                className={styles.button}
                                onClick={handleUpdateClick}
                                loading={isLoading}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePackage;
