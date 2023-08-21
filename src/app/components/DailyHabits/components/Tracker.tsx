import { useState, useEffect } from 'react';
import { CogIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import EmojiPicker, { EmojiStyle, Emoji } from 'emoji-picker-react';
import { TwitterPicker } from 'react-color';

const Tracker: React.FC<TrackerProps> = ({ habitIndex, tracker, handleUpdateRender }) => {
    const [today] = useState(new Date());
    const [currentAmount, setCurrentAmount] = useState<number>(tracker.currentValue);
    const [isCooldown, setIsCooldown] = useState<boolean>(false);
    const [initialRenderComplete, setInitialRenderComplete] = useState(false);
    const [showModal, setShowModal] = useState<boolean>(false);


    //states for the edit modal
    const [newName, setNewName] = useState<string>(tracker.name);
    const [newMaxValue, setNewMaxValue] = useState<number>(tracker.maxValue);
    const [newIcon, setNewIcon] = useState<string>(tracker.icon);
    const [newColor, setNewColor] = useState<string>(tracker.color);
    const [newUnit, setNewUnit] = useState<string>(tracker.unit);
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    let colors = ['#CE769C', '#7975D1', '#68A0CA', '#FF6900', '#FCB900', '#7BDCB5', '#00D084', '#8ED1FC', '#0693E3', '#ABB8C3', '#EB144C', '#F78DA7', '#9900EF']


    const handleCurrentAmountChange = (newAmount: number, effectCount: boolean, effectReset: boolean) => {
        if (!isCooldown && newAmount >= 0 && newAmount <= tracker.maxValue) {
            setIsCooldown(true);
            setCurrentAmount(newAmount);

            let dailyHabits = JSON.parse(localStorage.dailyHabits);
            dailyHabits[habitIndex].currentValue = newAmount;
            localStorage.setItem('dailyHabits', JSON.stringify(dailyHabits));

            if (effectCount) {
                playSoundCountWater();
            }
            if (effectReset) {
                playSoundResetWater();
            }
            setTimeout(() => {
                setIsCooldown(false);
            }, 1000);
        }
    }

    const playSoundCountWater = () => {
        const audio = new Audio('/static/sounds/waterTrackCount.wav');
        audio.play();
    };

    const playSoundResetWater = () => {
        const audio = new Audio('/static/sounds/waterTrackReset.wav');
        audio.play();
    };

    useEffect(() => {
        let dailyHabits = JSON.parse(localStorage.dailyHabits);
        let firstRepaymentDate = new Date(dailyHabits[habitIndex].firstTrackerDate);
        if (firstRepaymentDate.getTime() < today.setHours(0, 0, 0, 0)) {
            handleCurrentAmountChange(0, false, false);
            dailyHabits[habitIndex].firstTrackerDate = today.toString();
            localStorage.setItem('dailyHabits', JSON.stringify(dailyHabits));
        }
        if (currentAmount === 1) {
            dailyHabits[habitIndex].firstTrackerDate = today.toString();
            localStorage.setItem('dailyHabits', JSON.stringify(dailyHabits));
        }
    }, [currentAmount]);

    useEffect(() => {
        let dailyHabits = JSON.parse(localStorage.dailyHabits);
        let firstRepaymentDate = new Date(dailyHabits[habitIndex].firstTrackerDate);
        if (firstRepaymentDate.getTime() < today.setHours(0, 0, 0, 0)) {
            handleCurrentAmountChange(0, false, false);
            dailyHabits[habitIndex].firstTrackerDate = today.toString();
            localStorage.setItem('dailyHabits', JSON.stringify(dailyHabits));
        }
        setInitialRenderComplete(true);
    }, []);

    const getPercentage = (done: number, max: number): number => {
        return Math.round((done / max) * 100 / 10) * 10;
    }

    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    }

    //function editHabitTracker that edit the tracker on the local storage with the new values
    const editHabitTracker = () => {
        let dailyHabits = JSON.parse(localStorage.dailyHabits);
        dailyHabits[habitIndex].name = newName;
        dailyHabits[habitIndex].maxValue = newMaxValue;
        dailyHabits[habitIndex].icon = newIcon;
        dailyHabits[habitIndex].color = newColor;
        dailyHabits[habitIndex].unit = newUnit;
        dailyHabits[habitIndex].currentValue = 0;
        dailyHabits[habitIndex].firstTrackerDate = today.toString();
        localStorage.setItem('dailyHabits', JSON.stringify(dailyHabits));
        handleUpdateRender();
        closeModal();
    }

    //function that validate new state values 
    const validateNewState = () => {
        if (newName === "") {
            alert("Please enter a name for your tracker");
            return false;
        }
        if (newMaxValue === 0) {
            alert("Please enter a max value for your tracker");
            return false;
        }
        if (newUnit === "") {
            alert("Please enter a unit for your tracker");
            return false;
        }
        if (newIcon === "") {
            alert("Please enter an icon for your tracker");
            return false;
        }
        if (newColor === "") {
            alert("Please enter a color for your tracker");
            return false;
        }
        return true;
    }



    //function deleteHabitTracker that delete the tracker on the local storage
    const deleteHabitTracker = () => {
        //add window confirm to delete the tracker
        if (!window.confirm("Are you sure you want to delete this tracker?")) return;

        let dailyHabits = JSON.parse(localStorage.dailyHabits);
        dailyHabits.splice(habitIndex, 1);
        localStorage.setItem('dailyHabits', JSON.stringify(dailyHabits));
        handleUpdateRender();
        setInterval(() => {
            closeModal();
        }, 1000);
    }

    const handleSetEmoji = (emoji: string) => {
        setNewIcon(emoji);
        setShowEmojiPicker(false);
    }

    if (!initialRenderComplete) {
        return null;
    } else {
        return (
            <>
                <div className="flex flex-col">
                    <div style={{ borderColor: tracker.color }} className={`absolute w-[250px] z-0 h-14 bg-white border-2 rounded-xl p-2`}>
                    </div>
                    <div className="absolute z-10 h-14 w-[250px]">
                        <div
                            className={`z-10 h-14 rounded-xl animate-fill-both duration-500 ${getPercentage(currentAmount, tracker.maxValue) === 0 && 'opacity-0'}`}
                            style={{
                                width: `${(currentAmount / tracker.maxValue) * 100}%`,
                                backgroundColor: tracker.color
                            }}
                        >
                        </div>
                    </div>
                    <div className="absolute z-20 h-14 p-2 w-[250px]">
                        <div className="flex flex-row gap-3">
                            <div className="w-2/12">
                                <div style={{ backgroundColor: tracker.color }} className={`h-[34px] w-[34px] rounded-md shadow-habit py-2 text-xl justify-center content-center flex`}>
                                    <Emoji unified={tracker.icon} size={20} />
                                </div>
                            </div>
                            <div className="w-8/12">
                                <h1 className="text-main-primary font-bold text-sm">{tracker.name.toUpperCase()}</h1>
                                <h1 className="text-gray font-bold text-xs"> {currentAmount}/{tracker.maxValue} {tracker.unit.toUpperCase()}</h1>
                            </div>
                            <span onClick={openModal} className="flex items-center justify-center hover:cursor-pointer">
                                <CogIcon className="h-[24px] w-[24px] text-gray" />
                            </span>
                            <div className={`w-2/12 flex justify-center content-center py-2`}>
                                <PlusIcon
                                    className={`animate-delay-100 animate-fadeIn ${currentAmount === tracker.maxValue && 'hidden'
                                        } ${isCooldown && 'opacity-0 animate-fadeOut'} h-[24px] w-[24px] text-gray hover:cursor-pointer`}
                                    onClick={() => handleCurrentAmountChange(currentAmount + 1, true, false)}
                                />
                                <div className={`absolute ${!isCooldown ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
                                    <Image
                                        width={20}
                                        height={20}
                                        src="/icons/loading.svg"
                                        className={`animate-twSpin animate-infinite h-[24px] w-[24px] text-gray`}
                                        alt="loading..."
                                    />
                                </div>
                                <ArrowPathIcon
                                    className={`animate-delay-100 animate-fadeIn ${!(currentAmount === tracker.maxValue) && 'hidden'} ${isCooldown && 'opacity-0'} h-[24px] w-[24px] text-gray hover:cursor-pointer`}
                                    onClick={() => handleCurrentAmountChange(0, false, true)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {showModal && (
                    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 flex items-center justify-center z-50">
                        <div className="bg-main-primary p-4 rounded-3xl shadow w-auto sm:w-80 text-white border-[2px] border-white">
                            <h2 className="text-xl font-bold mb-4 text-center">Edit Tacker</h2>
                            <div className="flex flex-col gap-3 text-main-primary">
                                <h3 className="text-lg font-bold px-1 text-white">Name: </h3>
                                <input
                                    type='text'
                                    placeholder='Enter tracker name'
                                    className="text-primary-main rounded-full py-2 placeholder:px-3 px-3"
                                    value={newName} onChange={(e) => setNewName(e.target.value)}
                                />
                                <h3 className="text-lg font-bold px-1 text-white">Unit Name: </h3>
                                <input
                                    type='text'
                                    placeholder='Enter unit name'
                                    className="text-primary-main rounded-full py-2 placeholder:px-3 px-3"
                                    value={newUnit} onChange={(e) => setNewUnit(e.target.value)}
                                />
                                <h3 className="text-lg font-bold px-1 text-white">Icon: </h3>
                                <div className="flex flex-row gap-10 content-center justify-start">
                                    <button
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="border-white border-2 text-white hover:text-main-primary hover:bg-white rounded-full px-5"
                                    >
                                        Edit Icon
                                    </button>
                                    <Emoji unified={newIcon} size={25} />
                                </div>
                                {
                                    showEmojiPicker === true &&
                                    <div className="absolute">
                                        <EmojiPicker
                                            emojiStyle={EmojiStyle.APPLE}
                                            onEmojiClick={(e) => handleSetEmoji(e.unified)}
                                        />
                                    </div>
                                }
                                <h3 className="text-lg font-bold px-1 text-white">Color: </h3>
                                <TwitterPicker
                                    color={newColor}
                                    onChange={(e) => setNewColor(e.hex)}
                                    colors={colors}
                                />
                                <h3 className="text-lg font-bold px-1 text-white">Objective amount: </h3>
                                <input type="number" className="text-main-primary rounded-full py-2" defaultValue={newMaxValue} onBlur={(e) => setNewMaxValue(Number(e.target.value))} />
                            </div>
                            <div className="flex justify-end mt-4 gap-3">
                                <button className="border-2 border-white hover:text-main-primary hover:bg-white px-4 py-2 rounded-full text-white" onClick={() => editHabitTracker()}>
                                    Save
                                </button>
                                <button className="border-2 border-white hover:text-main-primary hover:bg-white px-4 py-2 rounded-full text-white" onClick={() => deleteHabitTracker()}>
                                    delete
                                </button>
                                <button className="border-2 border-white hover:text-main-primary hover:bg-white px-4 py-2 rounded-full text-white" onClick={closeModal}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }
};

export default Tracker;