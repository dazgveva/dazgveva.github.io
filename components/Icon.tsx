import type { ComponentType } from 'react';
import {
  ArchiveBoxArrowDownIcon, ArchiveBoxIcon, ArrowDownOnSquareIcon, ArrowDownTrayIcon, ArrowLeftIcon, ArrowPathIcon,
  ArrowRightEndOnRectangleIcon, ArrowRightIcon, ArrowRightStartOnRectangleIcon, ArrowsRightLeftIcon, ArrowTrendingDownIcon,
  ArrowUpRightIcon, ArrowUpTrayIcon, Bars3Icon, BuildingLibraryIcon, ArrowUturnLeftIcon, Battery100Icon, BellIcon, BoltIcon, BuildingOffice2Icon,
  ChatBubbleLeftIcon, ChatBubbleOvalLeftEllipsisIcon, CheckBadgeIcon, CheckCircleIcon, CheckIcon, ChevronDownIcon,
  ChevronLeftIcon, ChevronRightIcon, ClipboardDocumentListIcon, ClockIcon, CodeBracketIcon, CpuChipIcon, CreditCardIcon,
  CubeIcon, CursorArrowRaysIcon, DevicePhoneMobileIcon, DocumentCheckIcon, DocumentDuplicateIcon, DocumentTextIcon,
  ExclamationCircleIcon, ExclamationTriangleIcon, HandRaisedIcon, IdentificationIcon, InboxIcon, InformationCircleIcon,
  KeyIcon, LinkIcon, LockClosedIcon, LockOpenIcon, MagnifyingGlassIcon, MagnifyingGlassMinusIcon, MapIcon, MinusIcon,
  PaperAirplaneIcon, PencilSquareIcon, PhoneArrowUpRightIcon, PhoneIcon, PhotoIcon, PlusIcon, PresentationChartBarIcon,
  QuestionMarkCircleIcon, ReceiptPercentIcon, ShieldCheckIcon, SignalIcon, SparklesIcon, Squares2X2Icon, TableCellsIcon,
  TrashIcon, UserCircleIcon, UserIcon, UserPlusIcon, UsersIcon, WifiIcon, XCircleIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
// Themed icons that Heroicons doesn't have (insurers, packages, car) and social logos.
import {
  Car, Castle, CircleOff, Facebook, Grape, Infinity as InfinityIcon, Instagram, Linkedin, MountainSnow, PiggyBank,
  Sailboat, Scale, Sun, Waves, Youtube,
} from 'lucide-react';

type Svg = ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: boolean }>;

const HERO: Record<string, Svg> = {
  'shield-check': ShieldCheckIcon, shield: ShieldCheckIcon, 'log-in': ArrowRightEndOnRectangleIcon, 'log-out': ArrowRightStartOnRectangleIcon,
  compass: MapIcon, upload: ArrowUpTrayIcon, image: PhotoIcon, 'image-up': PhotoIcon, 'file-image': PhotoIcon,
  'credit-card': CreditCardIcon, 'scan-line': IdentificationIcon, 'circle-check': CheckCircleIcon, check: CheckIcon, x: XMarkIcon,
  'circle-x': XCircleIcon, 'circle-alert': ExclamationCircleIcon, 'triangle-alert': ExclamationTriangleIcon, info: InformationCircleIcon,
  'refresh-cw': ArrowPathIcon, 'loader-circle': ArrowPathIcon, 'rotate-ccw': ArrowUturnLeftIcon, 'trash-2': TrashIcon,
  'arrow-left-right': ArrowsRightLeftIcon, 'arrow-right': ArrowRightIcon, 'arrow-left': ArrowLeftIcon, 'arrow-up-right': ArrowUpRightIcon,
  sparkles: SparklesIcon, 'wand-sparkles': SparklesIcon, 'badge-check': CheckBadgeIcon, bot: CpuChipIcon, 'list-checks': ClipboardDocumentListIcon,
  'badge-percent': ReceiptPercentIcon, 'trending-down': ArrowTrendingDownIcon, plus: PlusIcon, minus: MinusIcon,
  lock: LockClosedIcon, 'lock-open': LockOpenIcon, phone: PhoneIcon, 'message-circle': ChatBubbleOvalLeftEllipsisIcon,
  'phone-call': PhoneArrowUpRightIcon, send: PaperAirplaneIcon, clock: ClockIcon, hourglass: ClockIcon, history: ClockIcon,
  search: MagnifyingGlassIcon, 'search-x': MagnifyingGlassMinusIcon, pencil: PencilSquareIcon, presentation: PresentationChartBarIcon,
  'mouse-pointer-click': CursorArrowRaysIcon, inbox: InboxIcon, plug: LinkIcon, 'building-2': BuildingOffice2Icon,
  copy: DocumentDuplicateIcon, contact: UserCircleIcon, 'package-check': CubeIcon, bell: BellIcon, smartphone: DevicePhoneMobileIcon,
  'message-square': ChatBubbleLeftIcon, signal: SignalIcon, wifi: WifiIcon, 'battery-full': Battery100Icon,
  'chevron-left': ChevronLeftIcon, 'chevron-right': ChevronRightIcon, 'chevron-down': ChevronDownIcon,
  'layout-dashboard': Squares2X2Icon, users: UsersIcon, user: UserIcon, 'user-plus': UserPlusIcon, gavel: HandRaisedIcon,
  'scroll-text': DocumentTextIcon, 'table-2': TableCellsIcon, braces: CodeBracketIcon, archive: ArchiveBoxIcon,
  'archive-restore': ArchiveBoxArrowDownIcon, 'key-round': KeyIcon, save: ArrowDownOnSquareIcon, 'plug-zap': BoltIcon,
  download: ArrowDownTrayIcon, menu: Bars3Icon, landmark: BuildingLibraryIcon, 'file-check': DocumentCheckIcon, star: StarIcon,
};
const LUCIDE: Record<string, Svg> = {
  sun: Sun, castle: Castle, waves: Waves, 'mountain-snow': MountainSnow, sailboat: Sailboat, grape: Grape, 'circle-off': CircleOff,
  infinity: InfinityIcon, scale: Scale, 'piggy-bank': PiggyBank, car: Car,
  facebook: Facebook, instagram: Instagram, linkedin: Linkedin, youtube: Youtube,
};

/** One icon by the demo's name; Heroicons first, Lucide for the themed ones. */
export function Icon({ name, className }: { name: string; className?: string }) {
  const L = LUCIDE[name];
  if (L) return <L className={className} strokeWidth={1.75} aria-hidden />;
  const H = HERO[name] ?? QuestionMarkCircleIcon;
  return <H className={className} aria-hidden />;
}
