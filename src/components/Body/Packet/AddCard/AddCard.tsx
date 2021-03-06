import ReactDOM from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import portalElement from '../../../../elements/portalElement';
import CircledPlus from '../../../../generatedIcons/CircledPlus.js';
import classes from './AddCard.module.css';
import Memorization from './Memorization';
import PartOfSpeechModal, { circleStyle, partsOfSpeech } from './PartOfSpeechModal';
import { CheckVector } from '../../../../generatedIcons';
import TagsModal from './TagsModal';
import { useAppDispatch, useAppSelector } from '../../../../hooks/reduxHooks';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { packetsActions } from '../../../../store/redux-logic';
import { CardType } from '../../../../types/types';
import uniqid from 'uniqid';
import DeleteCardButton from './DeleteCardButton';

const AddCard = ({ editMode = false }: { editMode?: boolean }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const params = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const packetDir = useAppSelector(state => state.packets.find(p => p.language === params.language)!.dir);
    const cardInfo = useAppSelector(state => state.packets.find(p => p.language === params.language)!.cards.find(c => c.cardId === searchParams.get('cardid')));
    // Refs: 
    const termRef = useRef<HTMLInputElement>(null);
    const definitionRef = useRef<HTMLTextAreaElement>(null);
    const usageRef = useRef<HTMLTextAreaElement>(null);
    const relatedRef = useRef<HTMLInputElement>(null);
    const dialectRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        termRef.current!.value = cardInfo?.term ?? "";
        definitionRef.current!.value = cardInfo?.definition ?? "";
        usageRef.current!.value = cardInfo?.usage ?? "";
        relatedRef.current!.value = cardInfo?.related ?? "";
        dialectRef.current!.value = cardInfo?.dialect ?? "";
    }, [cardInfo]);
    // States: 
    const [showPartOfSpeechModal, setShowPartOfSpeechModal] = useState(false);
    const [chosenPOS, setChosenPOS] = useState(cardInfo?.pos ?? "");
    const handleChoose = (pos: string) => {
        if (chosenPOS === pos) {
            setChosenPOS("");
        } else {
            setChosenPOS(pos);
        }
        setShowPartOfSpeechModal(false);
    };
    const [needsRevision, setNeedsRevision] = useState(cardInfo?.needsRevision ?? false);
    const toggleNeedsRevision = () => {
        setNeedsRevision(prev => !prev);
    };
    const [tagsModalShown, setTagsModalShown] = useState(false);
    const [tags, setTags] = useState<string[]>(cardInfo?.tags ?? []);
    const addTag = (tag: string) => {
        if (!tags.includes(tag)) {
            setTags(prev => [...prev, tag]);
        }
    };
    const removeTag = (tag: string) => {
        setTags(prev => prev.filter(t => t !== tag));
    };
    const [memorization, setMemorization] = useState(cardInfo?.memorization ?? 0);
    const handleSetMemorization = (level: number) => {
        setMemorization(level);
    }
    const handleAdd = () => {
        if (termRef.current!.value.length > 0) {
            if (!editMode) { // new card
                const cardToAdd: CardType = { cardId: uniqid(), term: termRef.current!.value, definition: definitionRef.current!.value, pos: chosenPOS, usage: usageRef.current!.value, needsRevision: needsRevision, tags: tags, related: relatedRef.current!.value, dialect: dialectRef.current!.value, memorization: memorization }; 
                dispatch(packetsActions.addCardToPacket({ packetLanguage: params.language!, card: cardToAdd }));
                navigate(-1);
            } else { // editing an existing card
                const cardUpdatedInfo: CardType = { cardId: cardInfo!.cardId, term: termRef.current!.value, definition: definitionRef.current!.value, pos: chosenPOS, usage: usageRef.current!.value, needsRevision: needsRevision, tags: tags, related: relatedRef.current!.value, dialect: dialectRef.current!.value, memorization: memorization }; 
                dispatch(packetsActions.updateCard({ packetLanguage: params.language!, newCardInfo: cardUpdatedInfo }));
                navigate(-1);
            }
        }
    };
    return (
        <div className={classes.addCardWrapper} dir={t('globalDir')} style={needsRevision ? { backgroundColor: "#FAF1ED" } : {}}>
            <div onClick={handleAdd} style={{ position: "fixed", zIndex: 6, width: "12vw", height: "50px", top: "0", right: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><CheckVector /></div>
            <div dir={packetDir} style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", width: "100vw" }}>
                <input ref={termRef} type="text" style={{ width: "80vw", fontSize: "1.5rem", backgroundColor: needsRevision ? "#FAF1ED" : "#fafafa" }} className={classes.requiredInput} placeholder={t('term')} />
                {chosenPOS ? <div style={{ backgroundColor: partsOfSpeech[chosenPOS].color, ...circleStyle }} onClick={() => setShowPartOfSpeechModal(true)}>{chosenPOS}</div> : <CircledPlus onClick={() => setShowPartOfSpeechModal(true)} />}
                {showPartOfSpeechModal && ReactDOM.createPortal(<PartOfSpeechModal handleChoose={handleChoose} handleExit={() => setShowPartOfSpeechModal(false)}/>, portalElement)}
            </div>
            <textarea ref={definitionRef} placeholder={t('definition')} className={classes.definition} style={needsRevision ? { backgroundColor: "#FAF1ED" } : {}} />
            <textarea dir={packetDir} ref={usageRef} placeholder={t('examples_of_usage')} className={classes.exampleUsage} />
            <div style={{ display: "flex", justifyContent: "space-evenly", width: "100vw", marginTop: "2vh" }}>
                <div className={`${classes.button} ${classes.buttonOfSet}`} style={needsRevision ? { backgroundColor: "#ee4444", color: "white" } : {}} onClick={toggleNeedsRevision}>{t('needs_revision')}</div>
                <div onClick={() => setTagsModalShown(true)} className={`${classes.button} ${classes.buttonOfSet}`}>{t('tags')}...</div>
                {tagsModalShown && ReactDOM.createPortal(<TagsModal handleExit={() => setTagsModalShown(false)} tags={tags} addTag={addTag} removeTag={removeTag} />, portalElement)}
            </div>
            <input dir={packetDir} ref={relatedRef} type="text" className={classes.otherInput} placeholder={t('related_words')} style={needsRevision ? { backgroundColor: "#FAF1ED" } : {}} />
            <input ref={dialectRef} type="text" className={classes.otherInput} placeholder={t('dialect')} style={needsRevision ? { backgroundColor: "#FAF1ED" } : {}} />
            <Memorization chosenLevel={memorization} handleSetMemorization={handleSetMemorization} />
            {editMode && <DeleteCardButton />}
        </div>
    )
};

export default AddCard;