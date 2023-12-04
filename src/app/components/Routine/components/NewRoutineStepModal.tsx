import React, { useEffect, useState } from 'react';

const NewRoutineStepModal: React.FC<NewRoutineStepModalProps> = ({ closeModal, setUpdateRoutineStep, updateRoutineStep, updateTaskList }) => {
    const [name, setName] = useState<string>('');
    const [pomodoroAmount, setPomodoroAmount] = useState<number>(0);
    const [taskLists, setTaskLists] = useState<TaskList[]>([]);
    const [selectedTaskList, setSelectedTaskList] = useState<number>(-1);
    const [createNewList, setCreateNewList] = useState<boolean>(false);
    const [newTaskListName, setNewTaskListName] = useState<string>('');

    const createNewRoutineStep = (): void => {
        if (typeof window !== 'undefined' && validateForm()) {
            let taskListIndex = selectedTaskList;

            //if create new list is true, create new list and add it to taskLists and set selectedTaskList to the new list
            if (createNewList === true) {
                let currentTaskLists: TaskList[] = JSON.parse(localStorage.getItem('taskLists') || '[]');
                let newTaskList: TaskList = {
                    name: newTaskListName,
                    highlightedTask: -1,
                    tasks: [],
                }
                currentTaskLists.push(newTaskList);
                localStorage.setItem('taskLists', JSON.stringify(currentTaskLists));
                setTaskLists(currentTaskLists);
                taskListIndex = currentTaskLists.length - 1;

                // fired custom event on localStorage data changed
                const event2 = new CustomEvent('taskListdatachanged') as any;
                document.dispatchEvent(event2);
            }

            let currentRoutine: Step[] = JSON.parse(localStorage.getItem('routine') || '[]');
            let newStep: Step = {
                header: name,
                pomodoros: pomodoroAmount,
                currentPomodorosCount: 0,
                assignedTaskList: taskListIndex,
                order: currentRoutine.length,
            }
            currentRoutine.push(newStep);
            localStorage.setItem('routine', JSON.stringify(currentRoutine))

            // fired custom event on localStorage data changed
            const event = new CustomEvent('routinedatachanged') as any;
            document.dispatchEvent(event);

            if (currentRoutine.length === 1) {
                localStorage.setItem('currentRoutineStep', JSON.stringify(0));

                // fired custom event on localStorage data changed
                const event = new CustomEvent('routinedatachanged') as any;
                document.dispatchEvent(event);

            }
            setUpdateRoutineStep(!updateRoutineStep);
            closeModal();

            if(createNewList === true) {
                updateTaskList()
            }
        }
    }

    const validateForm = (): boolean => {
        if (createNewList === true && newTaskListName === '') {
            window.alert('Please enter a name for the task list');
            return false;
        }
        if (name === '') {
            window.alert('Please enter a name for the step');
            return false;
        }
        if (pomodoroAmount === 0) {
            window.alert('Please enter a number of pomodoros');
            return false;
        }
        return true;
    }


    const getCurrentTaskLists = (): TaskList[] => {
        if (typeof window !== 'undefined') {
            return JSON.parse(localStorage.getItem('taskLists') || '[]');
        }
        return [];
    }

    useEffect(() => {
        setTaskLists(getCurrentTaskLists());
    }, [])

    return (
        <div className="absolute top-0 left-0 w-full h-full bg-main-primary bg-opacity-90 flex items-center justify-center z-50">
            <div className="bg-main-primary p-4 rounded-3xl shadow w-auto sm:w-80 text-white border-[2px] border-white">
                <h2 className="text-xl font-bold mb-4">New routine step</h2>
                <div className="flex flex-col gap-5 text-main-primary">
                    <input
                        type='text'
                        placeholder='Enter step name'
                        className="text-primary-main rounded-full py-2 placeholder:px-3 px-3"
                        value={name} onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type='number'
                        min={0}
                        placeholder='Enter number of pomodoros'
                        className="text-primary-main rounded-full py-2 placeholder:px-3 px-3"
                        onChange={(e) => setPomodoroAmount(Number(e.target.value))}
                    />
                    <div className="flex flex-row items-center gap-5 text-white px-2">
                        <input id="createNewList" type="checkbox" checked={createNewList} onClick={() => setCreateNewList(!createNewList)} />
                        <label htmlFor="">Create new task list instead</label>
                    </div>
                    {
                        createNewList === false &&
                        <select
                            value={selectedTaskList}
                            onChange={(e) => setSelectedTaskList(Number(e.target.value))}
                            className="text-primary-main rounded-full py-2 placeholder:px-3 px-3"
                        >
                            <option disabled value={-1}>select an option</option>
                            {
                                taskLists.map((taskList, index) => {
                                    return (
                                        <option key={index} value={index}>{taskList.name}</option>
                                    )
                                })
                            }
                        </select>
                    }
                    {
                        createNewList === true &&
                        <input
                            type='text'
                            placeholder='Enter new task list name'
                            className="text-primary-main rounded-full py-2 placeholder:px-3 px-3"
                            value={newTaskListName}
                            onChange={(e) => setNewTaskListName(e.target.value)}
                        />
                    }
                </div>
                <div className="flex justify-end mt-4 gap-3">
                    <button className="border-2 border-white hover:text-main-primary hover:bg-white px-4 py-2 rounded-full text-white" onClick={createNewRoutineStep}>
                        Save
                    </button>
                    <button className="border-2 border-white hover:text-main-primary hover:bg-white px-4 py-2 rounded-full text-white" onClick={closeModal}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewRoutineStepModal;
