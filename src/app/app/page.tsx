"use client"
import { useState, useEffect, use } from 'react';
import { useMainComponent } from '../layoutComponents/mainComponent';
import { useStartScreen } from '../layoutComponents/startScreen';
import { useMiddleScreen } from '../layoutComponents/middleScreen';
import { useEndScreen } from '../layoutComponents/endScreen';
import PomodoroTimer from '../components/PomodoroTimer/PomodoroTimer';
import DailyHabits from '../components/DailyHabits/DailyHabits';
import HelpButton from '../components/HelpButton/HelpButton';
import HelpOptionList from '../components/HelpButton/HelpOptionList';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import Tasks from '../components/Tasks/Tasks';
import Image from 'next/image';
import SigninButton from '../components/SigninButton/SigninButton';
import { useSession, getSession, signIn } from "next-auth/react"
import TaskLists from '../components/TaskLists/TaskLists';

export default function App() {
  const [currentTaskList, setCurrentTaskList] = useState<number>(0);
  const [updateTaskList, setUpdateTaskList] = useState<boolean>(false);
  const [updateRoutineStep, setUpdateRoutineStep] = useState<boolean>(false);
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [showList, setShowList] = useState(false);
  const { MainComponent } = useMainComponent();
  const { StartScreen } = useStartScreen();
  const { MiddleScreen } = useMiddleScreen();
  const { EndScreen } = useEndScreen();
  const [finishRender, setFinishRender] = useState<boolean>(false);
  const [showTour, setShowTour] = useState<boolean>(false);
  const [loadingDB, setLoadingDB] = useState<boolean>(true);
  const { data: session, status } = useSession();

  const loadData = async () => {
    if (session?.user?.profile_id === '966536f3-a528-4754-a474-2b7be0cff440') {
      // request to /sync endpoint with jwt token
      const response = await fetch('/api/load', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.status === 200) {
        const { habits, pomodoro, taskLists } = await response.json();

        if (habits !== undefined && habits !== null && habits.length > 0) {
          localStorage.setItem('dailyHabits', JSON.stringify(habits));
        }
        if (pomodoro !== undefined && pomodoro !== null) {
          localStorage.setItem('isShortBreak', pomodoro.isShortBreak);
          localStorage.setItem('pomodoroTotalCount', pomodoro.pomodoroTotalCount);
          localStorage.setItem('autoStart', pomodoro.autoStart);
          localStorage.setItem('longBreakDuration', pomodoro.longBreakDuration);
          localStorage.setItem('pomodoroDuration', pomodoro.pomodoroDuration);
          localStorage.setItem('shortBreakDuration', pomodoro.shortBreakDuration);
          localStorage.setItem('firstPomodoroCountDate', pomodoro.firstPomodoroCountDate);
          localStorage.setItem('shortBreakCount', pomodoro.shortBreakCount);
          localStorage.setItem('isBreak', pomodoro.isBreak);
          localStorage.setItem('pomodorosForLongBreak', pomodoro.pomodorosForLongBreak);
          localStorage.setItem('pomodoroCount', pomodoro.pomodoroCount);
          localStorage.setItem('isLongBreak', pomodoro.isLongBreak);
          localStorage.setItem('longBreakCount', pomodoro.longBreakCount);
        }
        if (taskLists !== undefined && taskLists !== null && taskLists.length > 0) {
          localStorage.setItem('taskLists', JSON.stringify(taskLists));
          localStorage.setItem('currentTaskList', '0');
        }
        setShowTour(false);
        setLoadingDB(false);
      }
    }
    if(session?.user?.profile_id === '06966125-4262-4947-97e4-82caa9572616'){
      setLoadingDB(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [session])

  const handleButtonClick = () => {
    setShowList(!showList);
  };

  const changeTaskList = (taskListIndex: number) => {
    setCurrentTaskList(-1);
    if (taskListIndex >= 0 && taskListIndex < JSON.parse(localStorage.getItem('taskLists') || '[]').length) {
      setCurrentTaskList(taskListIndex);
      setUpdateTaskList(!updateTaskList);
    }
  };

  useEffect(() => {
    const currentStoredTaskLists = JSON.parse(localStorage.getItem('taskLists') || '[]');
    if (currentStoredTaskLists && currentStoredTaskLists.length > 0) {
      setCurrentTaskList(0);
    }

    if (currentStoredTaskLists.length === 0) {

      let taskList: TaskList = {
        name: 'Example Task List',
        highlightedTask: null,
        tasks: [],
      };

      let taskLists: TaskList[] = [];
      taskLists.push(taskList);
      localStorage.setItem('taskLists', JSON.stringify(taskLists));
      setCurrentTaskList(0);
    }
    handleTour();
    setFinishRender(true);
  }, []);

  useEffect(() => {
    const storedTaskLists = JSON.parse(localStorage.getItem('taskLists') || '[]');
    if (storedTaskLists && storedTaskLists.length > 0 && currentTaskList >= 0) {
      setTaskList([]);
      setTimeout(() => {
        setTaskList(storedTaskLists[currentTaskList].tasks);
      }, 1);
    }
  }, [currentTaskList, updateTaskList])

  const handleCurrentRoutineStepCount = (): void => {
    if (typeof window !== 'undefined') {
      let currentRoutine: Step[] = JSON.parse(localStorage.getItem('routine') || '[]');
      let currentRoutineStep: number = Number(localStorage.getItem('currentRoutineStep') || '-1');

      if (currentRoutineStep > -1) {
        let step: Step = currentRoutine[currentRoutineStep];
        if (step && step.currentPomodorosCount < step.pomodoros) {
          step.currentPomodorosCount = step.currentPomodorosCount + 1;
          currentRoutine[currentRoutineStep] = step;
          localStorage.setItem('routine', JSON.stringify(currentRoutine));

          // fired custom event on localStorage data changed
          const event = new CustomEvent('routinedatachanged') as any;
          document.dispatchEvent(event);

          if (step.currentPomodorosCount === step.pomodoros) {
            currentRoutineStep = currentRoutineStep + 1;
            localStorage.setItem('currentRoutineStep', currentRoutineStep.toString());

            // fired custom event on localStorage data changed
            const event = new CustomEvent('routinedatachanged') as any;
            document.dispatchEvent(event);

            let newSelectedStep: Step = currentRoutine[currentRoutineStep];
            if (newSelectedStep && newSelectedStep.assignedTaskList > -1) {
              changeTaskList(newSelectedStep.assignedTaskList);
            }
          }
        }
        setUpdateRoutineStep(!updateRoutineStep);
      }
    }
  }

  const handleTour = () => {
    const storedTour = localStorage.getItem('tour');
    if (storedTour === null) {
      localStorage.setItem('tour', JSON.stringify(true));
    } else {
      setShowTour(JSON.parse(storedTour));
    }
  }

  const handleTourEnd = () => {
    setShowTour(false);
    localStorage.setItem('tour', JSON.stringify(false));
  }

  const handleTourStart = () => {
    setShowTour(true);
    localStorage.setItem('tour', JSON.stringify(true));
  }

  const handleUpdateTaskList = () => {
    setUpdateTaskList(!updateTaskList);
  }

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      handleTourEnd();
    }
  };

  if (status === "unauthenticated") {
    signIn('google', { callbackUrl: '/app' });
    return <p>Loading...</p>
  }

  if (loadingDB === true) {
    return <p>Loading...</p>
  }

  if (!finishRender) {
    return null
  } else {

    if (status === "loading") {
      return <p>Loading...</p>
    }

    return (
      <>
        <div className="sm:hidden xl:inline lg:inline md:inline">
          <Joyride
            callback={handleJoyrideCallback}
            steps={[
              {
                content: (<h2>{"Let's begin our journey!"}</h2>),
                locale: { skip: (<strong aria-label="skip">{"S-K-I-P"}</strong>) },
                placement: 'center',
                target: 'body',
              },
              {
                target: '.pomodoro-timer',
                content: 'This is just a pomodoro timer, you can use it to focus on your tasks! You can also use it to track your pomodoros for your routines.  ',
              },
              {
                target: '.daily-habits',
                content: 'This is your daily habits tracker, you can use it to track your daily habits, like drinking water, meditating, reading, etc.',
              },
              {
                target: '.task-list-selector',
                content: 'This is your task list selector, you can use it to select your task list or create new ones.',
              },
              {
                target: '.toolbar-tasks',
                content: 'Here you can create new tasks, prioritize the tasks in the current list, move tasks to another list, remove done tasks or also remove all tasks from the list.',
              },
              {
                target: '.tasks-list',
                content: 'Here are your tasks, in the menu you can use our tool to add a priority to tasks. You can also pick one task and put it in the top with the fire button that appears when you hover over a task. You can also delete a task by clicking on the trash button.',
              },
              {
                content: (<h2>{"That's it at the moment. I hope this tool help you as much as it helps me on my daily tasks. Have a productive day!"}</h2>),
                placement: 'center',
                target: 'body',
              },
            ]}
            run={showTour}
            showProgress
            showSkipButton
            continuous
            hideCloseButton
            styles={{
              options: {
                zIndex: 10000,
              },
            }}
          />
          <MainComponent>
            <StartScreen className="overflow-auto scrollbar-hidden">
              <div className="flex justify-start xl:px-4 lg:px-3 content-center mt-4 mb-5">
                <Image width={50} height={50} src='/assets/hh_ico_white.png' alt="Logo" className="hover:cursor-pointer" onClick={() => window.scrollTo(0, 0)} />
              </div>
              <div className="flex justify-center content-center mt-4">
                <TaskLists
                  updateTaskList={handleUpdateTaskList}
                  currentTaskList={currentTaskList}
                  changeTaskList={setCurrentTaskList}
                />
              </div>
              <div className="absolute bottom-0 justify-center content-center p-5 border-t-2 border-gray w-full bg-[#323333]">
                <SigninButton />
              </div>
            </StartScreen>
            <MiddleScreen className="">
              <div className="flex justify-center content-center">
                <Tasks
                  taskList={taskList}
                  currentTaskListIndex={currentTaskList}
                  changeTaskList={setCurrentTaskList}
                  updateTaskList={updateTaskList}
                  setUpdateTaskList={setUpdateTaskList}
                />
              </div>
            </MiddleScreen>
            <EndScreen className="overflow-y-auto scrollbar-hidden pb-[30px]">
              <div className="flex justify-center content-center mt-4 mb-5">
                <PomodoroTimer
                />
              </div>
              <div className="flex justify-center content-center mt-10 pb-10">
                <DailyHabits />
              </div>
              <HelpButton onClick={handleButtonClick} />
              {showList && <HelpOptionList onClose={() => setShowList(false)} showTour={handleTourStart} />}
            </EndScreen>
          </MainComponent>
        </div>
      </>
    )
  }
}
